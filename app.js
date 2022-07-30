const express = require('express')
const requests = require('request')
const https = require('https')
const mailchimp = require("@mailchimp/mailchimp_marketing");
const bodyParser = require('body-parser');

const app = express()
const port =  process.env.PORT;

app.use(express.static('public'))

app.use(bodyParser.json());
// app.use(bodyParser.urlencoded());
app.use(bodyParser.urlencoded({ extended: true }));


mailchimp.setConfig({
    apiKey: 'YOUR_API_KEY',
    server: 'YOUR_SERVER',
  });

// app.use(express.static("/   public"));
// respond with "hello world" when a GET request is made to the homepage
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");
})



async function run(listId, subscribingUser) {
    const response = await mailchimp.lists.addListMember(listId, {
      email_address: subscribingUser.email,
      status: "subscribed",
      merge_fields: {
        FNAME: subscribingUser.firstName,
        LNAME: subscribingUser.lastName
      }
    });
  

    console.log(
      `Successfully added contact as an audience member. The contact's id is ${
        response.id
      }, status: ${response.status}.`
    );
    // console.log(response);
    const ans = {
        "response_id": response.id,
        "status":response.status
    }
    return ans;
  }


app.post('/failure', (req, res) => {
    res.redirect('/');
})

app.post('/', (req, res) => {
    const fname = req.body.fname;
    const lname = req.body.lname;
    const email = req.body.email;
    // const url = "https://us9.api.mailchimp.com/3.0/lists/" + "0e093d1a4f" + "/members";
    const listId = "0e093d1a4f";
    const subscribingUser = {
    firstName: fname,
    lastName: lname,
    email: email
    };

    run(listId, subscribingUser).then(reply => {
           if(reply.status == "subscribed"){
              console.log("done")
              res.sendFile(__dirname + "/success.html");
           }else{
               res.sendFile(__dirname + "/failure.html");
               console.log("oops")
           }
    }).catch(err =>{
        // console.log(err);
        res.sendFile(__dirname + "/failure.html");
        console.log("ERROR")
    });
//    console.log(reply);
//    console.log(reply.status);


});


app.listen(port || 3000, ()=>{
    console.log(`listening on port ${port}`);
})