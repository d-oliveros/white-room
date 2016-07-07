
export default {
  path: '/health',
  method: 'get',
  handler: (req, res) => {
    res.sendStatus(200);
    return 200;
  }
};
