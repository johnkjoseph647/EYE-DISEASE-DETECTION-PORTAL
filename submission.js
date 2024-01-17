const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

//put the corresponding values here
const config = {
    service:'gmail',
    auth:{
        user:"vidyarshetty2002@gmail.com",
        pass:"jeup umka byqn kmdi"
    }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, require("path").resolve(__dirname, "..") + "/upload");
    },
    filename: function (req, file, cb) {
        cb(null, "iris.jpg");
    },
});

const upload = multer({ storage: storage });
const irisUpload = upload.fields([{ name: "iris", maxCount: 1 }]);

const getDiseaseName = async(option, result) => {
    let name = '';
    switch(option){
        case 1:
            if(result === 0)
                name = 'Cataract'
            else
                name = 'No cataract'
            break;
        case 2:
            if(result === 0)
                name = 'Myopia'
            else
                name = 'No myopia'
            break;
        case 3:
            if(result === 1)
                name = 'Hypertension'
            else
                name = 'No hypertension'
            break;
        case 4:
            if(result === 0)
                name = 'Glaucoma'
            else
                name = 'No glaucoma'
            break;
        case 5:
            if(result === 1)
                name = 'Retinoblastoma'
            else
                name = 'No retinoblastoma'
            break;
        case 6:
            if(result === 0)
                name = 'Normal'
            else
                name = 'Not normal'
            break;
        default: name = 'undefined'
    }
    return name;
};

const generatePDF = async(name, age, gender, email, diseases) => {
    const doc = new PDFDocument();

    const writeStream = fs.createWriteStream('C:/Users/DELL/documents/eddw/major-project/backend/upload/report.pdf');
    doc.pipe(writeStream);

    doc.image('C:/Users/DELL/documents/eddw/major-project/backend/upload/logo.png', 50, 52, { width: 150 })
		.fillColor('#444444')
		.fontSize(10)
		.text('presidency university', 200, 65, { align: 'right' })
		.text('bengaluru, karnataka, India - 560064', 200, 80, { align: 'right' })
		.moveDown();

    doc.moveTo(35,170).lineTo(570, 170).stroke();
	
    doc.fontSize(20).font('Helvetica-Bold').text('Personal Details ', 35, 150);

	doc.fontSize(14)
        .font('Courier-BoldOblique')
        .text(`Name: ${name}`, 50, 200)
        .text(`Age: ${age}`, 50, 230)
        .text(`Gender: ${gender}`, 350, 200)
        .text(`Email: ${email}`, 350, 230);
        
    doc.moveTo(35, 270).lineTo(570, 270).stroke();
    doc.moveTo(35, 272).lineTo(570, 272).stroke();

    doc.image('C:/Users/DELL/documents/eddw/major-project/backend/upload/iris.jpg', 410, 310, {
        width: 125,
        height: 125
    });

    doc.fontSize(20).text('Results:', 35, 310);
    doc.moveDown();

    for (let i = 0; i < diseases.length; i++) {
        const [diseaseName, percentage] = diseases[i];

        doc.fontSize(20).text(`Disease: ${diseaseName}`, 35, doc.y);
        doc.moveDown();
        doc.fontSize(20).text(`Prediction percentage: ${(parseFloat(percentage) * 100).toFixed(3).toString()}`, 35, doc.y);
        doc.moveDown(2);
    }

    doc.fontSize(14).font('Helvetica-Bold').text('Tips for Healthy Eyes', { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(12).font('Helvetica').text('Taking care of your eyes is essential for maintaining good vision and overall eye health. Here are some tips to keep your eyes healthy:');

    doc.moveDown();

    doc.fontSize(12).font('Helvetica-Bold').text('1. Get regular eye exams:');
    doc.moveDown(0.2);
    doc.fontSize(12).font('Helvetica').text('Schedule regular eye exams with an optometrist or ophthalmologist to detect any vision problems or eye diseases at an early stage.');

    doc.moveDown();


    doc.fontSize(12).font('Helvetica-Bold').text('2. Protect your eyes from the sun:');
    doc.moveDown(0.2);
    doc.fontSize(12).font('Helvetica').text('Wear sunglasses with UV protection when you are exposed to the sun, and use wide-brimmed hats or caps to shield your eyes from direct sunlight.');

    doc.moveDown();

    doc.fontSize(12).font('Helvetica-Bold').text('3. Take regular breaks from screen time:');
    doc.moveDown(0.2);
    doc.fontSize(12).font('Helvetica').text('If you spend long hours working on a computer or using digital devices, take frequent breaks to rest your eyes and reduce eye strain. Follow the 20-20-20 rule: every 20 minutes, look away at something 20 feet away for 20 seconds.');

    doc.moveDown();

    doc.fontSize(12).font('Helvetica-Bold').text('4. Eat a healthy diet:');
    doc.moveDown(0.2);
    doc.fontSize(12).font('Helvetica').text('Include foods rich in vitamins A, C, and E, as well as omega-3 fatty acids, in your diet. Leafy greens, citrus fruits, fish, and nuts are examples of foods that promote eye health.');

    doc.moveDown();

    doc.fontSize(12).font('Helvetica-Bold').text('5. Practice good hygiene:');
    doc.moveDown(0.2);
    doc.fontSize(12).font('Helvetica').text('Wash your hands before touching your eyes or applying any eye products. Avoid rubbing your eyes, as it can cause irritation and spread germs.');

    doc.moveDown();

    doc.fontSize(12).font('Helvetica-Bold').text('6. Maintain a healthy lifestyle:');
    doc.moveDown(0.2);
    doc.fontSize(12).font('Helvetica').text('Get regular exercise, maintain a healthy weight, avoid smoking, and manage chronic conditions like diabetes, which can affect eye health.');

    doc.moveDown();

    doc.fontSize(12).font('Helvetica').text('By following these tips, you can help keep your eyes healthy and reduce the risk of eye-related problems.');

    doc.moveDown();

    doc.fontSize(13)
        .font('Helvetica-BoldOblique')
        .fillColor('red')
        .text(
            'This report is for informational purposes only and should not replace professional medical advice. ',
            50,
            680,
            { align: 'center', width: 500 },
        );
    doc.end();

    writeStream.on('finish', () => {
        console.log('PDF saved successfully');
        return 1;
    });

    writeStream.on('error', (err) => {
        console.error('Error saving PDF:', err);
        return 0;
    });

    return 1;
};

const sendEmailWithAttachment = async (name, toEmail) => {

    const transporter = nodemailer.createTransport(config);
    const mailGenerator = new Mailgen({
        theme:'default',
        product:{
            name:"OptiScan",
            link:"www.sit.ac.in",
            copyright: 'Copyright © 2023 OptiScan. All rights reserved.',
        },
    });

    const response = {
        body:{
            name,
            intro:'Thank you for using OptiScan. We are pleased to provide you with your report, which contains valuable insights about your eye health.\n\nPlease find the attached PDF file.Looking forward to your continued good health.',
            outro:"\n\n\nDisclaimer: This report is for informational purposes only and should not replace professional medical advice."
        }
    }

    const mail = mailGenerator.generate(response);
    const message = {
        from:"vidyarshetty2002@gmail.com",
        to:toEmail,
        subject:"OptiScan Results",
        html:mail,
        attachments: [ 
            {
                filename: 'report.pdf',
                path: "C:/Users/DELL/documents/eddw/major-project/backend/upload/report.pdf",
                cid: 'uniqreceipt_test.pdf' 
            }
        ]
    }

    try {
        await transporter.sendMail(message);
        console.log('Email sent successfully');
        return 1;
    } catch (error) {
        console.error('Error sending email:', error);
        return 0;
    }
};

router.post("/analyse", irisUpload, async (req, res) => {
    try {
        const { name, age, gender, disease, email } = req.body;
        if (!name || !age || !gender || !disease || !email) {
            res.status(400).send({ type: "error", message: "request not valid" });
            return;
        }

        const response = await axios.post('http://localhost:5000/check_disease',{user_selected_choice: disease});
        if(response.status === 200){
            if(response.data.valid === 0){
                res.status(200).send({ type: "success", message: "Invalid image, please upload a iris image.", "valid":0 });
                return;
            }
            const results = response.data.result;
            const diseases = []
            for(let i = 0; i<results.length; i++){
                const diseaseName = await getDiseaseName(parseInt(disease.split(",")[i]), parseInt(results[i][0]));
                const percentage = results[i][1];
                diseases.push([diseaseName, percentage])
            }
            const pdfResult = await generatePDF(name, age, gender, email, diseases);
            const mailResult = await sendEmailWithAttachment(name, email);
            console.log(pdfResult, mailResult);
            if(pdfResult && mailResult){
                res.send({type: "success", message:"Successfully sent the report to the mail id.", data: diseases, "valid":1});
            }else if(pdfResult && !mailResult){
                res.send({type: "success", message:"Email address not valid", data: diseases, "valid":1});
            }else{
                res.status(500).send({ type: "error", message: "Something Went Wrong", "valid":0 });
            }
        }else{
            res.status(500).send({ type: "error", message: "something went wrong", "valid":0 });
        }
        
    } catch (err) {
        console.error(err);
        res.status(500).send({ type: "error", message: err.message });
    }
});

module.exports = router;
