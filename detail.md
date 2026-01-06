1. What this assignment really is (high-level)
This is a Mini FinTech Wallet System assignment designed to evaluate whether you can:


Think like a product engineer


Design clean frontend flows


Implement business logic correctly


Handle real-world UI states & errors


Structure code professionally


Communicate clearly through documentation & tests


It is not just CRUD. It’s a simulation of a real wallet system, simplified.
📌 You are expected to build either:


Fullstack (Frontend + Backend), OR


Frontend with a mock/fake API



2. Core problem the system must solve
The system represents a digital wallet, where a user can:


See their wallet balance


See transaction history


Add money (credit)


Transfer money to another user (debit + fee)


Apply business rules (fees & limits)


See transaction status (pending/success/failed)


Experience proper UI feedback (loading, errors, empty states)


This mirrors real FinTech apps like Paytm / PhonePe / Wallet services.

3. Functional understanding (deep breakdown)
A. Dashboard
Purpose


Acts as the home screen of the wallet.


Must show


Current wallet balance


Last 10 transactions only


Different UI states:


Loading


Empty (no transactions)




📌 This tests:


API fetching


State management


Conditional rendering


UX clarity



B. Add Money Flow (Credit Transaction)
User action


Enters an amount


Submits the form


System behavior


Validate amount (required, numeric)


Call API


Update wallet balance


Create a transaction:


Type: credit


Status: likely success




📌 This tests:


Form validation


API integration


State updates


Transaction modeling



C. Transfer Money Flow (Debit Transaction)
This is the most important and complex part.
User inputs


Recipient (another user)


Amount


Business rules applied


Fee: 2% of amount


Limit: Max 10,000 per transaction


Flow


Validate input


Check limit


Calculate fee


Show confirmation modal


On confirm:


Deduct amount + fee


Record debit transaction


Optionally record fee as a separate line




Set transaction status:


pending → success OR failed




📌 This tests:


Business logic implementation


Edge-case handling


Confirmation UX


Real-world transaction modeling



D. Transaction History
Requirements


Full list of transactions


Filters:


Date range


Status (success / failed)




Delete transaction:


Soft delete is allowed




📌 This tests:


Filtering logic


State derivation


Clean UI lists


Understanding of data lifecycle



4. API expectations (very important)
They do not care if your backend is real or fake — they care about API thinking.
Minimum endpoints required:


GET /users


GET /transactions


POST /transactions


PATCH /transactions/:id → update status


DELETE /transactions/:id


📌 Balance can be:


Stored directly, OR


Derived dynamically:
balance = sum(credits) - sum(debits) - sum(fees)



This tests:


REST API design


Data modeling


Separation of concerns



5. Business rules (explicit + implicit)
Explicit


Fee: 2% (configurable via JSON)


Limit: 10,000 per transaction


Status flow:


pending → success / failed


failure must include a reason




Implicit (but expected)


No negative balances


No invalid amounts


Graceful failure handling



6. Mandatory UI/UX states (they care a LOT here)
You MUST show:


Loading indicators


Clear error messages


Empty states (not blank screens)


📌 This tests:


UX maturity


User empathy


Production-readiness mindset



7. Non-functional expectations (this separates juniors from strong candidates)
They are explicitly evaluating:
Code quality


Modular structure


Clean components/services


Linting


Security hygiene


Input validation


No secrets in repo


No unsafe HTML


Performance


Pagination (for large transaction lists)


Memoization where needed


Documentation


README with:


Setup steps


Architecture decisions


Assumptions


Limitations




Testing


8–10 unit/component tests


At least 1 integration test (critical flow)


📌 This is industry-level expectation, not college-level.

8. Timeline reveals their expectation level
The suggested 4–5 day plan shows:


This is not hacky code


They expect iterative development


They value polish and testing



9. What they are actually judging you on
Not just whether it works, but:


Can you model real-world wallet logic?


Can you handle edge cases?


Can you write clean, readable code?


Can you explain your decisions?


Can you think like a product engineer, not just a coder?



10. Final distilled understanding (one paragraph)

This assignment asks you to build a realistic mini digital wallet system that demonstrates frontend engineering skills, API-driven thinking, business-rule enforcement (fees & limits), clean UX states, proper error handling, modular code structure, and professional documentation and testing practices, all within a short but realistic product development timeline.

