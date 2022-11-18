Sample Bank Application
Hey there! This is my first Node js application and below I have provided minimum 
information about it. Please go through it.
This application contains 5 functionalities,
1. Register user: this function is simple as it is name, we just have to send data 
from the body and if the data is proper and contains all fields that are 
required then it will inserted into the mongodb.
2. Login: the user is authenticate by the email address and password then after 
login the token is generated and send to the user in the header.
3. Add funds: if a user wants to add fund in his account first he has to provide 
the token to authorize himself and the send amount in the body of the 
request.
4. Transfer funds: same as the user wants to transfer funds from one account to 
another, first authorize himself and give the email of receiver and amount to 
transfer so the transfer is done if two conditions are fulfilled that receiver 
should exits and amount must be smaller than the send bank balance
5. Forget password: after authorization the password you have send in the body 
of the request will updated.
6. Design Middleware for Authentication of API.
Decided API needs to be developed.
 app.route('/api/register')
 app.route('/api/transfer')
 app.route('/api/withdraw')
 app.route('/api/users')
 app.route('/api/transaction/:accountNumber')
 app.route('/api/balance/:Id')
 app.route('/api/changePassword')
 app.route('/api/forgotPassword)
 app.route('/api/user/:Id')
 app.route('/api/login')
app.route('/api/welcome')
app.route('/api/deposit')
