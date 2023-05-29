CI/CD pipeline

Workflow

1. make a branch
2. write changes locally
3. open pull request to dev
4. pre merge actions: (workflow)
	a. figure out which files changed (front or back end) and only continue with those
	b. run linter (es lint and pylint) (action
	c. build and run test container (for each eventually) (action)
	d. upload as to docker repo with branch tag (the name of the branch (eg: clientdek-frontend:"appointment_calendar") (action)
5. Merge pull request
6. Post merge
	a. re label docker image to dev
	b. deploy to dev with dev deploy task
	
5. Open pull request to main
	a. only if it comes from dev allow pull request
	b. wait for review
	c. run deploy main action

Trying again to find the cache!