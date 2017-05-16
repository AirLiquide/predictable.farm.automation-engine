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

    function SchedulerNode(n) {
        RED.nodes.createNode(this,n);
        this.topic = n.topic;
        this.repeat = n.repeat;
        this.crontab = n.crontab;
        this.once = n.once;
        var node = this;
        this.interval_id = null;
        this.cronjob = null;

        if (this.repeat && !isNaN(this.repeat) && this.repeat > 0) {
            this.repeat = this.repeat * 1000;
            if (RED.settings.verbose) { this.log(RED._("repeat = __repeat__",this)); }
            this.interval_id = setInterval( function() {
                node.send({});
            }, this.repeat );
        } else if (this.crontab) {
            if (RED.settings.verbose) { this.log(RED._("crontab = __crontab__",this)); }
            this.cronjob = new cron.CronJob(this.crontab,
                function() {
                    node.send({});
                },
                null,true);
        }

        if (this.once) {
            setTimeout( function() { node.send({payload:"test"}); }, 100 );
        }
    }

    RED.nodes.registerType("scheduler",SchedulerNode);

    SchedulerNode.prototype.close = function() {
        if (this.interval_id != null) {
            clearInterval(this.interval_id);
            if (RED.settings.verbose) { this.log(RED._("stopped")); }
        } else if (this.cronjob != null) {
            this.cronjob.stop();
            if (RED.settings.verbose) { this.log(RED._("stopped")); }
            delete this.cronjob;
        }
    }

    RED.httpAdmin.post("/inject/:id", RED.auth.needsPermission("inject.write"), function(req,res) {
        var node = RED.nodes.getNode(req.params.id);
        if (node != null) {
            try {
                node.receive();
                res.sendStatus(200);
            } catch(err) {
                res.sendStatus(500);
                node.error(RED._("Inject failed: __error__",{error:err.toString()}));
            }
        } else {
            res.sendStatus(404);
        }
    });
}
