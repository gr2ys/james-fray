<!--
	This file is part of ELCube.
	ELCube is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	ELCube is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	You should have received a copy of the GNU Affero General Public License
	along with ELCube.  If not, see <https://www.gnu.org/licenses/>.
-->
<template>
    <nk-page-layout class="mini" title="关于ELCube">
        <a-card title="关于ELCube">
<pre style="margin: 0 10px;">
ELCube&trade;（逻辑魔方&trade;），解决企业变更曲线与软件跟随曲线不匹配的问题。我们追求开发一套快速、
容易的企业级模型方案，让企业更从容，让程序员走出困境。用业务建模的方式解决业务问题，
而不是用技术堆砌的方式绑定企业。查看更多关于ELCube的信息，请参阅 <a href="http://elcube.cn" target="_blank">http://elcube.cn</a>.
</pre>
        </a-card>
        <a-card title="自由软件">
<pre style="margin: 0 10px;">
ELCube是免费软件：你可以重新发布和/或修改它；
它是根据GNU Affero通用公共许可证的条款发布的自由软件基金会，
或者许可证的第3版，或者（由您选择）任何更高版本。
ELCube的发布是希望它会有用，但没有任何保证；
甚至没有对适销性或适合某一特定目的。
GNU Affero通用公共许可证了解更多详细信息。
您应该已经收到GNU Affero通用公共许可证的副本还有ELCube。
如果没有，请参阅 <a href="https://www.gnu.org/licenses/" target="_blank">https://www.gnu.org/licenses/</a>.

ELCube is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
ELCube is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.
You should have received a copy of the GNU Affero General Public License
along with ELCube.  If not, see <a href="https://www.gnu.org/licenses/" target="_blank">https://www.gnu.org/licenses/</a>.
</pre>
        </a-card>
        <a-card title="ELCube版本">
            <a-list size="small" bordered :data-source="elcubeVersion">
                <a-list-item slot="renderItem" slot-scope="item">
                    {{ item.name }}
                    <span style="color: #999999;">{{ item.version }}</span>
                </a-list-item>
            </a-list>
        </a-card>
        <a-card title="服务端软件版本">
            <a-list size="small" bordered :data-source="versions">
                <a-list-item slot="renderItem" slot-scope="item">
                    {{ item.name }}
                    <span style="color: #999999;">{{ item.version }}</span>
                </a-list-item>
            </a-list>
        </a-card>
        <a-card title="Web端软件版本">
            <a-list size="small" bordered :data-source="frontVersions">
                <a-list-item slot="renderItem" slot-scope="item">
                    {{ item.name }}
                    <span style="color: #999999;">{{ item.version }}</span>
                </a-list-item>
            </a-list>
        </a-card>
    </nk-page-layout>
</template>

<script>
import version from "./version.json";

export default {
    created() {
        this.$http.get('/api/webapp/env')
            .then(res=>{
                this.elcubeBackend = res.data[1];
            });
    },
    computed:{
        elcubeVersion(){
            return [{
                name: "elcube backend",
                version: this.elcubeBackend
            },{
                name: "elcube front",
                version: version.version
            }]
        },
        frontVersions(){
            return Object.keys(version.dependencies)
                .map(key=>{
                    return {
                        name: key,
                        version: version.dependencies[key]
                    }
                });
        }
    },
    data(){
        return {
            elcubeBackend:undefined,
            versions:[
                {name:"ch.qos.logback",version:"1.2.3"},
                {name:"com.alibaba.astjson",version:"1.2.41"},
                {name:"com.aliyun.liyun-java-sdk-core",version:"4.5.10"},
                {name:"com.aliyun.liyun-java-sdk-kms",version:"2.11.0"},
                {name:"com.aliyun.liyun-java-sdk-ram",version:"3.1.0"},
                {name:"com.aliyun.oss.liyun-sdk-oss",version:"3.14.1"},
                {name:"com.apifan.common.ommon-random",version:"1.0.7"},
                {name:"com.beust.commander",version:"1.72"},
                {name:"com.carrotsearch.ppc",version:"0.8.1"},
                {name:"com.fasterxml.jackson",version:"2.10.4"},
                {name:"com.fasterxml.lassmate",version:"1.5.1"},
                {name:"com.fasterxml.uuid",version:"3.2.0"},
                {name:"com.github.axet.aptcha",version:"0.0.9"},
                {name:"com.github.jsqlparser",version:"4.2"},
                {name:"com.google.code.gson",version:"2.8.6"},
                {name:"com.huaweicloud.sdk-obs-java",version:"3.22.3"},
                {name:"com.lowagie.text",version:"2.1.7"},
                {name:"com.oracle.database.jdbc.jdbc8",version:"19.8.0.0"},
                {name:"com.squareup.okhttp3",version:"3.14.9"},
                {name:"com.zaxxer.ikariCP",version:"3.4.5"},
                {name:"com.zaxxer.parseBitSet",version:"1.2"},
                {name:"commons-codec.ommons-codec",version:"1.13"},
                {name:"commons-collections.ommons-collections",version:"3.2.1"},
                {name:"commons-dbcp.ommons-dbcp",version:"1.4"},
                {name:"commons-fileupload.ommons-fileupload",version:"1.3.3"},
                {name:"commons-io.ommons-io",version:"2.7"},
                {name:"commons-lang.ommons-lang",version:"2.4"},
                {name:"commons-logging.ommons-logging",version:"1.1.3"},
                {name:"commons-pool.ommons-pool",version:"1.6"},
                {name:"de.odysseus.juel",version:"2.2.7"},
                {name:"de.siegmar.ogback-gelf",version:"2.0.0"},
                {name:"eu.bitwalker.serAgentUtils",version:"1.2"},
                {name:"fr.opensagres.xdocreport",version:"2.0.2"},
                {name:"info.picocli",version:"4.3.2"},
                {name:"io.github.biezhi.inyPinyin",version:"2.0.3.RELEASE"},
                {name:"io.jsonwebtoken.jwt",version:"0.9.1"},
                {name:"io.lettuce",version:"5.2.2.RELEASE"},
                {name:"io.micrometer",version:"1.3.9"},
                {name:"io.netty",version:"4.1.50.Final"},
                {name:"io.opentracing",version:"0.33.0"},
                {name:"io.projectreactor.eactor-core",version:"3.3.6.RELEASE"},
                {name:"jakarta.activation",version:"1.2.2"},
                {name:"jakarta.annotation",version:"1.3.5"},
                {name:"jakarta.validation",version:"2.0.2"},
                {name:"jakarta.ws.rs",version:"2.1.6"},
                {name:"jakarta.xml.bind",version:"2.3.3"},
                {name:"javax.activation",version:"1.1.1"},
                {name:"javax.xml.bind",version:"2.3.0"},
                {name:"jline",version:"2.14.6"},
                {name:"joda-time",version:"2.10.6"},
                {name:"mysql.ysql-connector-java",version:"5.1.49"},
                {name:"org.ahocorasick",version:"0.4.0"},
                {name:"org.apache.ant",version:"1.9.15"},
                {name:"org.apache.commons.ommons-collections4",version:"4.1"},
                {name:"org.apache.commons.ommons-compress",version:"1.19"},
                {name:"org.apache.commons.ommons-lang3",version:"3.9"},
                {name:"org.apache.commons.ommons-math3",version:"3.6.1"},
                {name:"org.apache.httpcomponents",version:"4.*"},
                {name:"org.apache.logging.log4j",version:"2.12.1"},
                {name:"org.apache.lucene",version:"8.6.2"},
                {name:"org.apache.poi.oi",version:"4.1.2"},
                {name:"org.apache.poi.oxml-schemas",version:"1.4"},
                {name:"org.apache.velocity",version:"1.7"},
                {name:"org.apache.xmlbeans",version:"3.1.0"},
                {name:"org.apiguardian",version:"1.1.0"},
                {name:"org.aspectj.spectjweaver",version:"1.9.5"},
                {name:"org.camunda.bpm",version:"7.13.0"},
                {name:"org.camunda.commons.amunda-commons-logging",version:"1.9.0"},
                {name:"org.camunda.commons.amunda-commons-typed-values",version:"7.13.0"},
                {name:"org.camunda.commons.amunda-commons-utils",version:"1.9.0"},
                {name:"org.checkerframework.hecker-qual",version:"3.5.0"},
                {name:"org.codehaus.groovy",version:"2.5.12"},
                {name:"org.codehaus.jettison",version:"1.1"},
                {name:"org.elasticsearch.lasticsearch",version:"7.9.3"},
                {name:"org.glassfish.hk2.k2",version:"2.6.1"},
                {name:"org.hdrhistogram.drHistogram",version:"2.1.9"},
                {name:"org.hibernate.validator.ibernate-validator",version:"6.0.20.Final"},
                {name:"org.ini4j",version:"0.5.4"},
                {name:"org.javassist",version:"3.22.0-CR2"},
                {name:"org.jboss.logging.boss-logging",version:"3.4.1.Final"},
                {name:"org.jdom.dom2",version:"2.0.6"},
                {name:"org.junit.jupiter.unit-jupiter-engine",version:"5.5.2"},
                {name:"org.latencyutils.atencyUtils",version:"2.0.3"},
                {name:"org.liquibase.iquibase-core",version:"3.8.9"},
                {name:"org.logback-extensions.ogback-ext-spring",version:"0.1.4"},
                {name:"org.lz4.z4-java",version:"1.7.1"},
                {name:"org.mybatis.generator.ybatis-generator-core",version:"1.3.1"},
                {name:"org.mybatis.spring.boot",version:"2.0.0"},
                {name:"org.mybatis.ybatis",version:"3.5.0"},
                {name:"org.mybatis.ybatis-spring",version:"2.0.0"},
                {name:"org.opentest4j",version:"1.2.0"},
                {name:"org.ow2.asm",version:"5.0.4"},
                {name:"org.projectlombok.ombok",version:"1.18.12"},
                {name:"org.reactivestreams.eactive-streams",version:"1.0.3"},
                {name:"org.slf4j",version:"1.7.30"},
                {name:"org.springframework",version:"5.2.7.RELEASE"},
                {name:"org.springframework.boot.pring-boot",version:"2.2.8.RELEASE"},
                {name:"org.springframework.data.pring-data-elasticsearch",version:"3.2.8.RELEASE"},
                {name:"org.yaml.nakeyaml",version:"1.25"},
                {name:"oro",version:"2.0.8"},
                {name:"ru.yandex.clickhouse.lickhouse-jdbc",version:"0.3.1-patch"},
                {name:"stax",version:"1.0.1"},
            ]
        }
    }
}
</script>
<style scoped lang="less">
::v-deep{
    .ant-card + .ant-card{
        margin-top: 20px;
    }
}
</style>
