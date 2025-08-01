export const TEST_CASE = `Your task is to verify the key informational elements on the Wells Fargo Routing Numbers and Account Numbers help page.

Navigate to the page: https://www.wellsfargo.com/help/routing-number/.

Confirm that the page loads with the heading:
"Routing Numbers and Account Numbers".

Verify the presence of the question text:
"Are you looking for a routing number or an account number?"

Confirm that there are two radio buttons labeled:

"Routing number"

"Account number"
These should be located directly under the question text.

Confirm that the page includes a disclaimer at the bottom:
"Deposit products offered by Wells Fargo Bank, N.A. Member FDIC."

In the right-hand Resources section, verify that the following links are listed:

Sign Up for Direct Deposit

Send Money with Wells Fargo Online® Wires

View All Wells Fargo Online FAQs

Mailing Addresses

Get the Wells Fargo Mobile® app

Ensure that the footer contains standard Wells Fargo links, including:

Privacy, Cookies, Security & Legal

Do Not Sell or Share My Personal Information

Sitemap

About Wells Fargo

Careers

Home

Also, extract the DOM content of the footer section and include it in the response.`;

export const TEST_APP_URL = "https://www.wellsfargo.com/help/routing-number/";
export const USERNAME = "test_user_name";
export const PASSWORD = "test_password";

export const USER_INFO = {
  name: "Cua Blossom",
  email: "cua@example.com",
  address: "123 Main St, Anytown, USA",
};
