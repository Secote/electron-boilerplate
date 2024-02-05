import { net } from 'electron';
// make this a synchronous function so we can return a value
export function checkUrlValidity(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const request = net.request(url);
    // Set a timeout for the request
    const requestTimeout = setTimeout(() => {
      request.abort(); // Abort the request
      resolve(false); // Resolve the promise with false
    }, timeout);

    request.on('response', (response) => {
      clearTimeout(requestTimeout); // Clear the timeout

      const statusCode = response.statusCode;
      console.log(`Status code: ${statusCode}`);
      if (statusCode === 200) {
        resolve(true); // Resolve the promise with true for a valid page
      } else {
        resolve(false); // Resolve the promise with false for an invalid page
      }
    });

    request.on('error', (error) => {
      clearTimeout(requestTimeout); // Clear the timeout
      reject(error); // Reject the promise with the error
    });

    request.end();
  });
};
