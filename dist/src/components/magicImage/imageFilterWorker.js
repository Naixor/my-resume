importScripts('src/libs/cv.min.js');
onmessage = (event) => {
    console.log(self);
    postMessage(123);
    // CV.filter.Cartoon(event.data);
};
