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

export default {
    namespaced: true,
    state: {
        dict:{}
    },
    mutations: {
        setData(state,payload){
            state.dict[payload[0]]=payload[1];
        },
        getData(state,key){
            return state.dict[key];
        }
    },
    actions: {
        json({commit,state},key){
            return new Promise((resolve,reject)=>{

                let data = state.dict[key];

                if(data!==undefined){
                    resolve(data);
                    return;
                }

                this._vm.$http.get(`/api/platform/registry/value/json/@DICT/${key}`)
                    .then(res=>{
                        commit("setData",[key,res.data]);
                        resolve(res.data);
                    })
                    .catch(error=>{
                        reject(error);
                    })
            })
        }
    },
    getters: {
    }
}
