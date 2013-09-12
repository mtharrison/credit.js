credit.js
=========

A tool for getting your credit score programatically from Experian Credit Expert (UK)

1. Install dependencies
---------------------

To install all dependencies, simple run `npm install`

2. Add your credentials (optional)
---------------------

Add a file called `account.json` at the root and enter the following credentials:

	{
		"email": "mt.harrison86@gmail.com",
		"password": "my-password",
		"secret": "my-secret-word"
	}

If you don't want to do this, you will be prompted for your credentials each time.

3. Run it
---------------------

Enter `node credit.js` or `./credit.js` to run it as an executable
