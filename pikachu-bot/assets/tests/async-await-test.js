// for (let recipient of recipients) {
//     try {
//         await recipient.send(content, embed);
//     } catch (e) {
//         //console.log(e);
//     }
// }

// recipents.forEach(function(recipient) {
//     const promiseLink = function() {
//         const deferred = 
//     }
// });


// await Promise.all(recipients.map(recipient => recipient.send("message").catch(() => {})));
// return new Promise((resolve, reject) => { 
//     if(recipient.name !== 'A') {
//         console.log(recipient.name);
//         return resolve('Recipient ' + recipient.name + ' received DM!');
//     } else {
//         return reject(new Error('Fail'));
//     }
// });

// Function that attemps to mimic `message.send()` with a sure case of one promise be rejected
function logName(recipient) {
    if(recipient.name !== 'A') {
        return Promise.resolve(recipient);
    } else {
        return Promise.reject(new Error('FAIL'));
    }
}

// Async function that attempts to mimic call of multiple `message.send()` inside my bot
async function doAsyncOps(recipients, logName) {
    await Promise.all(recipients.map(recipient => logName(recipient)
        .then((recipient) => {
            console.log('Message to ' + recipient.name + ' was sent!');
        })
        .catch((e) => {console.log('Error caught! ' + recipient.name + ' did not receive message!');})));
}

// Declare test array of objects to represent collection of members
const recipients = [{name: 'A'}, {name: 'B'}, {name: 'C'}, {name: 'D'}];
doAsyncOps(recipients, logName); // Fire away test
