import time
from uuid import uuid4
from enum import Enum
from threading import Thread
from django.db import models
from django.db.models import Q
from django.db import transaction
from django.dispatch import Signal
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from django.utils.functional import cached_property
from .base.models import StaticModel, OperatableMixin, OperationModel, M2MOperatableMixin, M2MOperationModel
from django.utils.timezone import now

import importlib, json
class Cloud(StaticModel):
    _driver=models.CharField(max_length=50)
    _platform_credential=models.TextField(max_length=5120,blank=True,null=True)
    _instance_credential=models.TextField(max_length=2048,blank=True,null=True)    
    hosts=models.TextField(max_length=5120,blank=True,null=True)
    owner=models.ForeignKey(User,on_delete=models.PROTECT,editable=False,verbose_name='admin')
    @cached_property
    def driver(self):
        return importlib.import_module(self._driver)
    @cached_property
    def platform_credential(self):
        return json.loads(self._platform_credential)
    @cached_property
    def instance_credential(self):
        return json.loads(self._instance_credential)

def clouds_of_user(self):
    return Cloud.objects.filter(
        balance__in=self.balances(),
        enabled=True,
    ).filter(Q(public=True) | Q(owner=self)).distinct()
User.clouds=clouds_of_user

class Image(StaticModel):
    name=models.CharField(max_length=50)
    cloud=models.ForeignKey(Cloud,on_delete=models.PROTECT)
    access_id = models.CharField(max_length=50,verbose_name="actual id on the cloud")
    hostname=models.CharField(max_length=50,default='packone')
    parent=models.ForeignKey("self",on_delete=models.PROTECT,blank=True,null=True)
    class Meta:
        unique_together = ('cloud', 'name')
    @cached_property
    def remedy_script(self):
        s="###remedy image: {}###\n{}\n".format(self.name,self._remedy_script) if self._remedy_script else ""
        if self.parent:
            s=self.parent.remedy_script+s
        return s
    def launch(self, template, owner, remedy_script='', number=1, remark=None):
        hostname=self.hostname
        if number>1:
            parts=hostname.split('.')
            hostname='.'.join((parts[0]+str(number),'.'.join(parts[1:])))
        ins=Instance(
            cloud=self.cloud,
            template=template,
            image=self,
            hostname=hostname,
            remedy_script_todo=remedy_script,
            owner=owner,
            remark=remark
        )
        ins.save()
        return ins

class InstanceTemplate(StaticModel):#TODO support root volume resize
    name=models.CharField(max_length=50)
    cloud=models.ForeignKey(Cloud,on_delete=models.PROTECT)
    access_id = models.CharField(max_length=50,verbose_name="actual id on the cloud")
    vcpu=models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    mem=models.PositiveIntegerField(default=512,validators=[MinValueValidator(256)])
    class Meta:
        verbose_name = "template"
        unique_together = ('cloud', 'name')
    def __str__(self):
        return "{}/vcpu:{},mem:{}".format(self.name,self.vcpu,self.mem)

class InstanceBlueprint(StaticModel):
    name=models.CharField(max_length=50)
    cloud=models.ForeignKey(Cloud,on_delete=models.PROTECT)
    template=models.ForeignKey(InstanceTemplate,on_delete=models.PROTECT)
    image=models.ForeignKey(Image,on_delete=models.PROTECT,related_name="instance_blueprints")
    volume_capacity=models.IntegerField(validators=[MinValueValidator(0)],default=0)
    volume_mount_point=models.CharField(default="/data",max_length=100)
    quantity=models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    class Meta:
        verbose_name = "blueprint"
        unique_together = ('cloud', 'name')
    def __str__(self):
        return "{}/{}/{}".format(self.image,self.template,self.quantity)
    @transaction.atomic
    def launch(self, owner, next_number=1, remark=None):
        if not remark: remark='launched from instance_blueprint: {}'.format(self)
        inss=[]
        for number in range(next_number,next_number+self.quantity):
            ins=self.image.launch(
                template=self.template,
                owner=owner,
                remedy_script=self.remedy_script,
                number=number,
                remark=remark
            )
            inss.append(ins)
            if self.volume_capacity:
                volume=Volume(
                    cloud=self.cloud,
                    capacity=self.volume_capacity,
                    owner=owner,
                    remark=remark
                )
                volume.save()
                Mount(
                    point=self.volume_mount_point,
                    instance=ins,
                    volume=volume
                ).save()
        return inss

def blueprints_of_user(self):
    return InstanceBlueprint.objects.filter(
        cloud__in=self.clouds(),
        enabled=True
    ).filter(Q(public=True) | Q(owner=self))
User.blueprints=blueprints_of_user

#TODO class VLan

class INSTANCE_STATUS(Enum):#greater value means worse status
    null=0 #unknown
    active=1
    block=2
    suspend=3
    shutdown=4
    poweroff=5
    breakdown=6
    pause=7
    failure=8 #libvirt reserv code
    host_lost=9
    instance_lost=10
    building=11
        
monitored = Signal(providing_args=["instance","name"])

class Instance(models.Model,OperatableMixin):
    ipv4=models.GenericIPAddressField(protocol='IPv4',blank=True,null=True,editable=False)
    ipv6=models.GenericIPAddressField(protocol='IPv6',blank=True,null=True,editable=False)
    cloud=models.ForeignKey(Cloud,on_delete=models.PROTECT)
    uuid=models.UUIDField(unique=True,auto_created=False,null=True,editable=False)
    image=models.ForeignKey(Image,on_delete=models.PROTECT)
    template=models.ForeignKey(InstanceTemplate,on_delete=models.PROTECT)
    hostname=models.CharField(max_length=50,blank=True,null=True)#TODO not null, unique and templated
    remedy_script_todo=models.TextField(max_length=51200,default="",blank=True)
    created_time=models.DateTimeField(auto_now_add=True)
    built_time=models.DateTimeField(blank=True,null=True,editable=False)
    remark = models.CharField(blank=True,null=True,max_length=100)
    owner=models.ForeignKey(User,on_delete=models.PROTECT,editable=False)
    status= models.PositiveIntegerField(choices=[(status.value,status.name) for status in INSTANCE_STATUS],default=INSTANCE_STATUS.building.value,editable=False)
    deleting = models.BooleanField(default=False,editable=False)
    def __str__(self):
        return "{}/{}/{}".format(self.image.name,self.template.name,self.ipv4)
    @staticmethod
    def get_operation_model():
        return InstanceOperation
    @property
    def ready(self):
        return self.uuid
    @property
    def building(self):
        return self.built_time and not self.ready
    @cached_property
    def hosts_record(self):
        if not self.ready: raise Exception('instance not ready')
        hostname_parts=self.hostname.split('.')
        hostnames=' '.join(('.'.join(hostname_parts[0:pi+1]) for pi in range(0,len(hostname_parts))))		
        return self.ipv4+' '+hostnames
    @property
    def mountable(self):
        #TODO get mount condition from driver
        if self.status in [
            INSTANCE_STATUS.poweroff.value,
            INSTANCE_STATUS.shutdown.value
        ]: return True
        if self.status==INSTANCE_STATUS.building.value and self.ready: return True
        return False
    @property
    def umountable(self):
        return self.mountable
    def monitor(self,notify=True):
        if not self.ready: raise Exception('instance not ready')
        status = self.cloud.driver.vm_status(self.cloud.platform_credential,str(self.uuid))
        if self.__class__.objects.filter(pk=self.pk).update(status=status):
            self.refresh_from_db()
            if notify: monitored.send(sender=self.__class__, instance=self, name='monitored')
    
class VOLUME_STATUS(Enum):#greater value means worse status
    null=0 #unknown
    available=1
    mounted=2
    building=3 #executing remedy_script

class Volume(models.Model):
    cloud=models.ForeignKey(Cloud,on_delete=models.PROTECT)
    uuid=models.UUIDField(unique=True,auto_created=False,null=True,editable=False)
    capacity=models.IntegerField()
    created_time=models.DateTimeField(auto_now_add=True)
    built_time=models.DateTimeField(blank=True,null=True,editable=False)
    remark = models.CharField(blank=True,null=True,max_length=100)
    owner=models.ForeignKey(User,on_delete=models.PROTECT,editable=False)
    status= models.PositiveIntegerField(choices=[(status.value,status.name) for status in VOLUME_STATUS],default=VOLUME_STATUS.building.value,editable=False)
    deleting = models.BooleanField(default=False,editable=False)
    def __str__(self):
        return "{}/{}/{}".format(self.cloud.name,self.capacity,str(self.uuid).split('-')[0])
    @property
    def ready(self):
        return self.uuid
    @property
    def building(self):
        return self.built_time and not self.ready
    @property
    def mountable(self):
        #TODO get mount condition from driver
        return self.status == VOLUME_STATUS.available.value
    @property
    def umountable(self):
        return self.status == VOLUME_STATUS.mounted.value
    def get_running_operations(self):
        return Mount.objects.filter(
            volume=self,
            dev__isnull=True,
            completed_time__isnull=False
        ).order_by('id')

#TODO add same-cloud check
class Mount(models.Model):
    volume=models.OneToOneField(Volume,on_delete=models.PROTECT)
    instance=models.ForeignKey(Instance,on_delete=models.PROTECT)
    dev=models.CharField(max_length=100,null=True,editable=False)
    point=models.CharField(default="/data",max_length=200)
    created_time=models.DateTimeField(auto_now_add=True)
    completed_time=models.DateTimeField(blank=True,null=True,editable=False)
    class Meta:
        unique_together = ('instance', 'point')
        default_permissions=('add', 'delete', 'view')
    def __str__(self):
        return "{}/{}/{}".format(self.instance,self.dev,self.point)
    @property
    def ready(self):
        return self.dev
    @property
    def executing(self):
        return self.completed_time and not self.ready

class INSTANCE_OPERATION(Enum):
    start="start"
    reboot="reboot"
    shutdown="shutdown"
    poweroff="poweroff"
    remedy="remedy"

class OPERATION_STATUS(Enum):
    success="success"
    failed="failed"
    running="running"
    waiting="waiting"
    
executed = Signal(providing_args=["instance","name"])

class InstanceOperation(OperationModel):
    target=models.ForeignKey(Instance,on_delete=models.CASCADE)
    log=models.TextField(max_length=51200,null=True,editable=False)
    def execute(self):
        def perform(self=self):
            from . import utils
            if self.operation!=INSTANCE_OPERATION.remedy.value:
                try:
                    output=self.target.cloud.driver.vm_op(
                        self.target.cloud.platform_credential,
                        str(self.target.uuid),
                        self.operation
                    )
                    if self.is_boot:
                        utils.SSH(self.target.ipv4,
                            self.target.cloud.instance_credential
                        ).close() #to wait booting finished
                except Exception as e:
                    self.status=OPERATION_STATUS.failed.value
                    self.log='EXCEPTION MESSAGE:\n'+str(e)
                else:
                    self.status=OPERATION_STATUS.success.value
                    self.log=output
            else:
                if not self.script:
                    self.log='EXCEPTION MESSAGE:\nblank remedy script'
                    self.status=OPERATION_STATUS.failed.value
                else:
                    try:
                        ssh=utils.SSH(self.target.ipv4, self.target.cloud.instance_credential)
                        out, err = ssh.exec_batch(self.script)
                        self.log=out+err
                        self.status=OPERATION_STATUS.failed.value if err else OPERATION_STATUS.success.value
                    except Exception as e:
                        self.log='EXCEPTION MESSAGE:\n'+str(e)
                        self.status=OPERATION_STATUS.failed.value
            self.completed_time=now()
            self.save()
            executed.send(sender=InstanceOperation, instance=self, name='executed')
        Thread(target=perform).start()

class Group(models.Model,M2MOperatableMixin):
    uuid=models.UUIDField(auto_created=True, default=uuid4, editable=False)
    instances=models.ManyToManyField(Instance,blank=True,editable=False)
    remedy_script_todo=models.TextField(max_length=51200,default="",blank=True)
    hosts=models.TextField(max_length=5120,default="",blank=True,editable=False)
    remark = models.CharField(blank=True,null=True,max_length=100)
    owner=models.ForeignKey(User,on_delete=models.PROTECT,editable=False)
    created_time=models.DateTimeField(auto_now_add=True)
    built_time=models.DateTimeField(blank=True, null=True, editable=False)
    status= models.PositiveIntegerField(choices=[(status.value,status.name) for status in INSTANCE_STATUS],default=INSTANCE_STATUS.building.value,editable=False)
    deleting = models.BooleanField(default=False,editable=False)
    class Meta:
        ordering = ['pk']
    def __str__(self):
        return self.long_id
    @property
    def long_id(self):
        return str(self.uuid).split('-')[0]
    @staticmethod
    def get_operation_model():
        return GroupOperation
    @property
    def operatables(self):
        return self.instances.all()
    @property
    def ready(self):
        return self.built_time
    @property
    def building(self):
        return self.built_time and not self.ready
    @property
    def mounts(self):
        return Mount.objects.filter(instance__in=self.instances.all())
    @transaction.atomic
    def delete(self, *args, **kwargs):
        if not self.ready:
            print('WARNNING: delete {} under building'.format(self._meta.verbose_name))
        operatables=self.operatables
        if operatables.exists():
            self.deleting=True
            self.save()
            for operatable in operatables:
                operatable.deleting=True
                operatable.save()
                for m in operatable.mount_set.select_related('volume').select_for_update():
                    if m.ready:
                        m.volume.deleting=True
                        m.volume.save()
                    else:
                        m.delete()
                InstanceOperation(
                    target=operatable,
                    operation=INSTANCE_OPERATION.poweroff.value,
                    manual=True
                ).save()
                time.sleep(0.1)
        else:
            super().delete(*args, **kwargs)

class GroupOperation(M2MOperationModel):
    target=models.ForeignKey(Group,on_delete=models.CASCADE)
    def __str__(self):
        return "{}({}/{})".format(self.batch,self.operation,self.status)
    class Meta(M2MOperationModel.Meta):
        verbose_name = "group operation"
    @staticmethod
    def get_sub_operation_model():
        return InstanceOperation