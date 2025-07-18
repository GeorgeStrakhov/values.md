I wonder what would it take for me to actually


... it's an arboretum. it's a grove. people


... it's an arboretum. it's a grove. peope come here for insight and to reflect in a haze of mirror mosaic labyrinths kaleidoscoping their thoughts together ...




what would it take for me to actually build a working project and ensure that it's correct.

so far, i've been mulling over a *really simple thing* for like over a month:
here's how i imagine it going:

- user accesses the langing page
- user clicks 'answer the ethics quiz' button (whatever it's called, "show dilemmas", probably)
- user enters the flow where they click through answers and dilemmas until..

- when they enter the flow we fetch a bunch of dilemmas and set up local storage to track the session and the dilemma-answer choices

+ this is where we need to mind the database connectivity schemas the four migrations we have written in our .ts files and be careful and diligent to not mismatch expectations of our various software components.

- ... until they answer enough, a pre-set number, like, 12 of them, at which point the ui says "hey you have enough to get your values.md", would you like that?

- and naturally they're expected to *do* like that and ask for their values.md, and get presented with it, with several paths leading from the page: see it used (in a benchmark across models, as a prepped experiment), share it with us and give us permission to use it for research (and see the research we've already performed on previously submitted anonymized data, unconditional of whether *this* user shares),

- and that's pretty much it

- there's another component to the app (let's call the above "main flow") that gets *necessarily invoked*, which is the combinatorial/statiscical/ontological analysis of the dilemma-answer(-motif-ethical reasoning framework) session and resynthesis of that into a values.md document. That should be a black box, a replaceable clearly deliniated component, that is the crux, the core, the heart of the app -- and we're going to have several and switch them around --

- there's a third major component which is all the prepped experiments to *do* with values.md wonce we obtain them

- there's a lot of fluff around that with docs, design docs, dev memos, testing, validation, monitoring, replaying scenarios, integration, env management, adequate representation of the pieces of the stack outside our full control (like vercel, github and neon), and so on.
I'd like that cleaned up and refurmulated into a project plan please, with SMART goals, planned atomic commits, and an approach that defends us from regressions and mismatches. Oh, and I totally don't mind if you do that in a *clean branch* of our project from the ground up, using the totality of the code in the repo as references (but limit yourself to the commits that have resulted in working deployments in the past. perhaps make a map of such commits and the *resolutions* the've introduced, as well, separately.)

