We are developing a system that invites user to create their own VALUES.md file which they can later use to guide their agents.

USER ROLES:

- user => normal visitor who comes, generates their values.md and leaves
- admin => site admin who can log in and generate new dilemmas etc. in the admin interface
- researcher => visitor who is interested in the research aspect and will be able to download all the anonymised dilemma and answers datasets to do independent analysis

CORE FUNCTIONALITY:

- user can go to the landing page and understand what is being offered here and start the generation proces
- user is presented with 12 randomly picked (?) dilemmas form our DB and gives their answers
- we combine and analyze their answers into their values.md file
- the user can see and download their values.md file
- all the interaction and answers so far are anonymous and stored in local storage / session storage
- at the end the user is given an option to contribute to global research - they can choose to save their anonymized answers to the database and answer a few pyschographic questions to attach to their answers
- if the user chose to save their answers to the DB - they get a unique link where their values.md file lives: e.g. https://values.md/values/{uuid}

- researcher can go to a special page related to research and download the dataset (a few csv files?) with (1) dilemma dataset and (2) all the answers added to the database

- admin can log into the admin panel and see the list of all dilemmas and generate new ones using LLMs

ALL THE OTHER FUNCITONALITY SHOULD COME LATER!!!