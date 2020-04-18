const nodemailer = require("nodemailer");
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 4000
const path = require("path");
const cors = require('cors')
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();

// async..await is not allowed in global scope, must use a wrapper
async function main(MsgObj) {

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: 'nanda.test.0311@gmail.com', // generated ethereal user
            pass: 'GooglePwd@0311' // generated ethereal password
        }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: 'nanda.test.0311@gmail.com', // sender address
        to: "nanda23311@gmail.com", // list of receivers
        subject: MsgObj.subject, // Subject line
        text: MsgObj.msg, // plain text body
        attachments:MsgObj.attachments
    });

    console.log("Message sent: %s", info.messageId);

    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
};



app.use(cors());
app.use(express.static(`${__dirname}/./build`));
app.use(express.static(`${__dirname}/./static`));
app.set('secretKey', 'key'); // jwt secret token
app.use(logger('dev'));
app.use(bodyParser.json({}));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get("/", async function (req, res) {
    try {
        res.sendFile(path.join(__dirname, './build/index.html'));
    } catch (error) {
        res.sendFile(path.join(__dirname, './static/not_found.html'));
    }
})

app.post("/upload", multipartMiddleware, async function (req, res) {
    // console.log("Req ", req)
    let reqBody = req.body;
    let reqFiles = req.files;
    try {
        let attachments = []
        for (let each in reqFiles) {
            let routeId  = reqBody.routeId.toString().toUpperCase()
            let drivername  = reqBody.drivername.toString().toUpperCase()
            let driverPhNumber  = reqBody.driverPhNumber.toString().toUpperCase()
            attachments.push({
                filename: ""+routeId+"-"+drivername+"-"+driverPhNumber+"-"+each,
                path: reqFiles[each].path
            })
        }
        let msg ="Route id : "+reqBody.routeId+"\nDriver Name : "+reqBody.drivername+" \nDriverPh No : "+reqBody.driverPhNumber
        let subject = "Route ID : "+reqBody.routeId+" , DriverPh No : "+reqBody.driverPhNumber
        main({msg:msg,subject:subject,attachments:attachments}).catch(console.error)
        res.status(200).json({
            status: 'success',
            code: 200,
            data: "done"
        });
        return
    } catch (error) {
        console.log("Error ", error)
        res.status(500).json({
            status: 'failure',
            code: 500,
            error: "Failure"
        });
        return;
    }
})

app.listen(port, function () {
    console.log('Node server listening on port ' + port);
});