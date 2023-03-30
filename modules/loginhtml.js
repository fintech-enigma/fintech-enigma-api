const loginHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Signin admin</title>
</head>
<body>
    <form action="/signinAdmin" method="post" style="width:10%; margin: auto; position: relative; top: 10rem;"> <br>
        <label>Username: <input type="text" name="username" id="username" placeholder="username" required></label> <br>
        <label>Password: <input type="password" name="password" id="password" placeholder="password" required></label> <br>
        <input type="submit" value="submit" class="submit">
    </form>
</body>
</html>`;

module.exports = loginHTML;