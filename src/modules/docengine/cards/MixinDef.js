/*
 * 	This file is part of ELCube.
 *	ELCube is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as published by
 *	the Free Software Foundation, either version 3 of the License, or
 *	(at your option) any later version.
 *	ELCube is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *	You should have received a copy of the GNU Affero General Public License
 *	along with ELCube.  If not, see <https://www.gnu.org/licenses/>.
 */
export default (defaultValue)=>{

  return {
    props: {
      editMode:Boolean,
      docDef:Object,
      cardKey:String,
    },
    computed:{
      card(){

        const card = this.docDef.cards.find(card=>card.cardKey===this.cardKey);
        if(!card.config){

          let config = undefined;
          if(typeof defaultValue==='function'){
            config = defaultValue();
          }else if(defaultValue){
            config = JSON.parse(JSON.stringify(defaultValue));
          }

          this.$set(card,'config',config);
        }
        return this.docDef.cards.find(card=>card.cardKey===this.cardKey);
      },
      def:{
        get(){
          return this.card.config;
        },
        set(value){
          this.card.config = value;
        }
      }
    },
    created(){
    },
    methods:{
      nk$callDef(options){
        return new Promise((resolve,reject)=>{
          this.$http.postJSON(
              `/api/def/doc/call`,
              {fromCard:this.card.beanName,def:this.def,options}
          )
          .then(response=>{
            resolve(response.data);
          })
          .catch(reject)
          .finally((e)=>{
            reject(e);
          })
        })
      },
    }
  };
}
