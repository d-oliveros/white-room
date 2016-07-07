
/**
 * Closes the window. Useful for closing popups.
 */
export default {
  path: '/popupclose',
  method: 'get',
  handler: (req, res) => res.send(`
    <html>
      <body>
        <script>
          window.close();
        </script>
      </body>
    </html>`)
};
