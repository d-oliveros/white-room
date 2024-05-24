import superagent from 'superagent';

export default async function pdfViewerController(req, res, next) {
  try {
    await superagent.get(req.query.pdfUrl)
      .set('Cookie', req.get('Cookie'))
      .pipe(res);
  }
  catch (error) {
    next(error);
  }
}
