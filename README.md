# Values.md

We are building a research project website where users can explore their own values and generate their "values.md" markdown file - the is intended to later instruct LLMs to make choices aligned with the user's values.

The user journey is as follows:

1. landing: understand what's going on. 
2. click a button to explore their values nd create their values.md
3. random 12 dilemmas (sufficiently different ones across params) are taken from the database
4. user answers dilemmas (chooses one of 4 options optionally adds reasoning). all choices are kept in local storage. for privacy reasons.
5. based on the users answers we programmatically generate their values.md file v1 and we show to them instructions on how to use it
6. we also show to them how their answers stack up against the "default" answers by the most popular leading LLMs of today
7. we ask the user permissions to add their choices to the database anonymously. if they agree - we ask for some socio-demographic information and add to the database of answers.
8. user can choose to do another round and keep growing / editing their values.md
9. researchers at any point can download the list of dilemmas and user answers and LLM answers for analysis


- /admin (password auth protected)=> admin panel where we can generate more pre-generated dilemmas, see stats, tune params etc.


TODO:

[ ] connect to the DB (remote postgres on neon)
[ ] create openrouter service for LLMs
[ ] create the /admin interface, password protect
[ ] create a simple "generate a dilemma" button in the admin interface that uses openrouter to generate a dilemma
[ ] create the ontology of the dilemmas, answers, motifs, metadata
[ ] design DB schema
[ ] populate the DB with key ingredients into a dilemma: ethical frameworks, motif, context (more details on this to follow)
[ ] create a dilemma generator that takes ingredients, generates dilemmas and add them to the DB
[ ] populate the DB with 100 dilemmas, making sure they are diverse
[ ] create the user interface steps
