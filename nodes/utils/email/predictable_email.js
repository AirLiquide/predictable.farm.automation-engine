/**
 * Created by Factory_5 on 11/07/2017.
 */
/**
 * POP3 protocol - RFC1939 - https://www.ietf.org/rfc/rfc1939.txt
 *
 * Dependencies:
 * * nodemailer - https://www.npmjs.com/package/nodemailer
 */

module.exports = function(RED) {
    "use strict";
    var nodemailer = require("nodemailer");
    var util = require("util");

    try {
        var globalkeys = RED.settings.email || require(process.env.NODE_RED_HOME+"/../emailkeys.js");
    }
    catch(err) {
    }

    function EmailNode(n) {
        RED.nodes.createNode(this,n);
        this.topic = n.topic;
        this.name = n.name;
        this.outserver = "YOUR_OUTBOUND_SERVER";
        this.outport = "465";
        this.secure = true;
        this.mail = n.mail;
        this.content = n.content;
        this.subject = n.subject;
        var flag = false;
        if (this.credentials && this.credentials.hasOwnProperty("userid")) {
            this.userid = this.credentials.userid;
        } else {
            if (globalkeys) {
                this.userid = globalkeys.user;
                flag = true;
            }
        }
        if (this.credentials && this.credentials.hasOwnProperty("password")) {
            this.password = this.credentials.password;
        } else {
            if (globalkeys) {
                this.password = globalkeys.pass;
                flag = true;
            }
        }

        this.userid = "YOUR_EMAIL_ACCOUNT";
        this.password = "YOUR_EMAIL_PASSWORD";
        if (flag) {
            RED.nodes.addCredentials(n.id,{userid:this.userid, password:this.password, global:true});
        }
        var node = this;

        var smtpOptions = {
            host: node.outserver,
            port: node.outport,
            secure: node.secure
        }

        if (this.userid && this.password) {
            smtpOptions.auth = {
                user: node.userid,
                pass: node.password
            };
        }
        var smtpTransport = nodemailer.createTransport(smtpOptions);

        this.on("input", function(msg) {
            if (msg.hasOwnProperty("payload")) {
                if (smtpTransport) {
                    node.status({fill:"blue",shape:"dot",text:"email.status.sending"});
                    var sendopts = { from: node.userid };   // sender address
                    sendopts.to = node.mail; // comma separated list of addressees
                    /*if (node.mail === "") {
                        sendopts.cc = msg.cc;
                        sendopts.bcc = msg.bcc;
                    }*/
                    sendopts.subject = node.subject || "Message from Node-RED"; // subject line
                        var payload = RED.util.ensureString(node.content);
                        sendopts.text = payload; // plaintext body
                        if (/<[a-z][\s\S]*>/i.test(payload)) { sendopts.html = payload; } // html body

                    smtpTransport.sendMail(sendopts, function(error, info) {
                        if (error) {
                            node.error(error,msg);
                            node.status({fill:"red",shape:"ring",text:"email.status.sendfail"});
                        } else {
                            node.log(RED._("email.status.messagesent",{response:info.response}));
                            node.status({});
                        }
                    });
                }
                else { node.warn(RED._("email.errors.nosmtptransport")); }
            }
            else { node.warn(RED._("email.errors.nopayload")); }
        });
    }
    RED.nodes.registerType("predictable_email",EmailNode,{
        credentials: {
            userid: {type:"text"},
            password: {type: "password"},
            global: { type:"boolean"}
        }
    });

};
