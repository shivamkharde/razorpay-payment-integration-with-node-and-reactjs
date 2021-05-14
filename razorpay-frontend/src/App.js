import "./App.css";

function loadRazorpayScript() {
	// return promise when script loading is done
	return new Promise((resolve) => {
		const script = document.createElement("script");
		script.src = "https://checkout.razorpay.com/v1/checkout.js";
		script.onload = () => {
			resolve(true);
		};
		script.onerror = () => {
			resolve(false);
		};
		document.body.appendChild(script);
	});
}

function App() {
	const loadRazorpay = async () => {
		// load the razorpay script
		let isLoaded = await loadRazorpayScript();

		// if its not able to load then show the error alert
		if (!isLoaded) {
			alert("razorpay is not loaded!! check internet connection");
			return;
		}

		// call an backend api to get all the product and customer info
		const data = await fetch("http://localhost:5500/payments/pay", { method: "POST" }).then(
			(data) => {
				return data.json();
			}
		);

		// razorpay options
		const options = {
			key: document.domain === "localhost" ? "rzp_test_4w5kOetsI59uot" : "PRODUCTION_KEY",
			currency: data.currency,
			amount: data.amount.toString(),
			order_id: data.order_id,
			name: "Some name of product/ service",
			description: "Please proceed with your payment",
			image: "https://picsum.photos/200",
			handler: function (response) {
				alert(response.razorpay_payment_id);
				alert(response.razorpay_order_id);
				alert(response.razorpay_signature);
			},
			prefill: {
				email: "some@gmail.com",
				name: "something",
			},
			theme: {
				color: "#c2c2c2",
			},
		};

		// create payment object from razorpay function and open a form for user
		const paymentObj = window.Razorpay(options);
		paymentObj.open();
	};

	return (
		<div className="App">
			<button type="button" onClick={loadRazorpay}>
				{"Pay With Razorpay".toUpperCase()}
			</button>
		</div>
	);
}

export default App;
