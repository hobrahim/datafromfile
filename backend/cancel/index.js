const functions = require('@google-cloud/functions-framework');

functions.http('run', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Payment Canceled</title>
        <script>
          alert("Payment was canceled. You will be redirected to the homepage.");
          setTimeout(function() {
            window.location.href = "/";
          }, 3000); // Redirect after 3 seconds
        </script>
      </head>
      <body>
        <h1>Payment Canceled</h1>
        <p>Redirecting to the homepage...</p>
      </body>
    </html>
  `);
});
