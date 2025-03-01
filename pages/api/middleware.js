import Cors from 'cors';

const cors = Cors({
  methods: ['GET', 'HEAD', 'POST'],
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function middleware(req, res) {
  await runMiddleware(req, res, cors);
}
