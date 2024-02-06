const functions = require('@google-cloud/functions-framework');

functions.http('run', (req, res) => {
    res.send(`
    <html>
      <head>
        <title>Payment Successful</title>
        <script>
          alert("Payment Successful! Redirecting to manage subscriptions...");
          setTimeout(function() {
            window.location.href = "/manage-subscription";
          }, 3000); // Redirect after 3 seconds
        </script>
      </head>
      <body>
        <h1>Payment Successful!</h1>
        <p>You will be redirected shortly...</p>
      </body>
    </html>
  `);
});
