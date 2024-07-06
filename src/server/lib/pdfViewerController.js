export default async function pdfViewerController(req, res, next) {
  try {
    const response = await fetch(req.query.pdfUrl, {
      headers: {
        'Cookie': req.get('Cookie')
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }

    response.body.pipe(res);

    response.body.on('error', (error) => {
      next(error);
    });
  }
  catch (error) {
    next(error);
  }
}
