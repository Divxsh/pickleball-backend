API ENDPOINTS

URL - https://pickleball.cyclic.app/api

Register - /auth/register
method - POST
body - Passed as JSON
{
    "firstName":"Divash",
    "lastName":"Gupta",
    "email":"dg@gmail.com",
    "password":"12345678"
}

login - /auth/login
method - POST
body - Passed as JSON
{
    "email":"dg@gmail.com",
    "password":"12345678"
}