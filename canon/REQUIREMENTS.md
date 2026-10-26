# Requirements

Recruiters, collaborators, and visitors arriving from LinkedIn, GitHub, or search find only fragments of Eric Le's story on each of those surfaces, and no one place under his own domain tells it whole.

This record holds at most 600 words.

## Goals

- A visitor gets a coherent summary of who he is and what he ships in one scroll of the landing page
- The page states the same facts as LinkedIn, the résumé, and the GitHub profile, without drift
- A visitor reaches the top of the site from anywhere on it, at any viewport
- A reader arriving on a project route from a shared link has a way back without scrolling to the end, through one persistent control and one closing affordance
- Navigation chrome holds one column on every surface, so it does not resize as a reader moves between the landing page and a route
- A visitor sees a card for each shipped project the author chooses to feature, carrying a still of the artifact and a link to where a reader installs or opens it
- Every shipped project owns a route answering for that project alone, carrying its demo larger than a card can, and labelled `Project` rather than `Case study`
- Every route states why the work was started before what it measured, and reports a measured result only where the project has one

## Non-goals

- Blog posts, a dated post feed, or a content management system
- Authentication, comments, a dashboard, or a backend, other than the cookie-free analytics Cloudflare runs from the zone
- Routes beyond the apex and one per shipped project
- A third exit on a project route, since the bar and the foot already answer at any scroll position and at the end of the read
- A landing-page link to a project that has no card, whose route is reached by its URL alone

## Constraints

- Static rendering by default, with client-side hydration only where a component opts in
- The reason a route gives for the work is the author's own, so a session carries one he already wrote on the site and never drafts a new one
