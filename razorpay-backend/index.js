const express = require("express");
const shortid = require("shortid");
const cors = require("cors");
const Razorpay = require("razorpay");
const dotenv = require("dotenv");
const crypto = require("crypto");

const app = express();

// configure cors
app.use(cors());
// configure dot env
dotenv.config();
// set middleware to parse json
app.use(express.json());

const port = process.env.PORT || 5500;

// homepage
app.get("/", (req, res, next) => {
	res.send("Homepage for Razorpay payments demo!!");
});

// url to accept payments
app.post("/payments/pay", async (req, res, next) => {
	// initialize  razorpay
	const razorpay = new Razorpay({
		key_id: process.env.RAZORPAY_KEY_ID,
		key_secret: process.env.RAZORPAY_KEY_SECRET,
	});
	// get all the product data from db
	const amount = 699; //indian rupees
	const currency = "INR"; //depend on ip or some other logic
	const receipt = shortid.generate();

	// payment capture should be always 1 cause we are not handling the payment ourself
	const payment_capture = 1;

	// creating a options object
	const options = {
		amount: amount * 100, //because razorpay accepts payment in paisa i.e. 100ps /1 rupees
		currency: currency,
		receipt: receipt,
		payment_capture,
	};
	// send this value to razorpay for creating a new order
	try {
		const response = await razorpay.orders.create(options);
		console.log(response);

		// send response to frontend
		res.json({
			order_id: response.id,
			currency: response.currency,
			amount: response.amount,
		});
	} catch (error) {
		console.log(error);
	}
});

// route to verify payment
// for this to work we need webhook in razorpay which will send the payment captured response to us if its valid
// create Payment.Captured webhook for this
app.post("/verification ", (req, res, next) => {
	// secret while setting up the webhook
	const secret = "12345678"; //we will get this when we setup webhook in razorpay account

	// compute the hmac because razorpay pay will do it
	const SHAsum = crypto.createHmac("sha256", secret);
	SHAsum.update(JSON.stringify(req.body));
	const digest = shasum.digest("hex");

	console.log(digest, req.headers["x-razorpay-signature"]);

	// check if digest and signature which razorpay sent us are equal or not if equal then payment is legit and we can store it in db or process it and do some task based on that
	if (digest === req.headers["x-razorpay-signature"]) {
		console.log("request is legit and do something");
		console.log(req.body);
	} else {
		// pass the request and do nothing
	}
	res.json({ status: "ok" });
});

// start the server
app.listen(port, () => {
	console.log("Server started at " + port);
});
