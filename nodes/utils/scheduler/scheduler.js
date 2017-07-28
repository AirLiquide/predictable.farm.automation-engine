/**
 * Copyright JS Foundation and other contributors, http://js.foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function(RED) {
    "use strict";
    var cron = require("cron");
    var schedule = require('node-schedule');

    function SchedulerNode(n) {
        RED.nodes.createNode(this,n);
        this.topic = n.topic;
        this.repeat = n.repeat;
        console.log(n.crontab);
        this.crontab = JSON.parse(n.crontab);
        this.once = n.once;
        var node = this;
        this.interval_id = null;
        this.cronjob = null;
        this.timeDays = n.timeDays;
        this.jobs = [];

        if (this.crontab.valid){
            this.crontab.value.forEach(function (el) {
                var job = schedule.scheduleJob(el, function(){
                    node.send({
                        valid:true
                    })
                });

                node.jobs.push(job);
            })

            this.on("close", function () {
                this.jobs.forEach(function (j) {
                    j.cancel();
                })
            });
        }

    }

    RED.nodes.registerType("scheduler",SchedulerNode);
};
