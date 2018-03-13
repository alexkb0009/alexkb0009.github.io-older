---
title: Issues - eParticipation Platform
layout: post
permalink: issues-eparticipation-platform
years: 2014-2015
tags: ["Python", "JavaScript", "Backbone.js", "Jinja2", "Platform", "MongoDB", "Redis", "OpenShift", "RESTful", "API", "Incomplete", "CSS3"]
description: Something Something something
link: https://github.com/alexkb0009/issues-platform
link_title: GitHub Repo
---


_My Issues_ (name not final) is a prototypical citizen-centric e-participation platform which aims to enhance the quantity and quality of communication between citizens and their representatives in legislature. This project is the outcome of my academic thesis which began in 2014 and development of it is still on-going during spare time. Contact if would like a copy of the thesis book, covering conceptual design and development of the platform in much greater depth.

### Technology

Platform backend is written in Python, aided by the Bottle.py microframework. Backend presents end-points for pages such as home, issue, and topic listings, and the remainder of back-end functionality is accessed through RESTful JSON API, as well a couple of simple non-JSON API endpoints. Page layout is built using Jinja2 (templating engine for Python) + Foundation (front-end framework), with majority of interactivity being implemented in JavaScript as part of Backbone.js models and views. The application instances of the platform can be scaled horizontally to accomodate any number of users and is set to do so through Red Hat's OpenShift PaaS which runs on Amazon Web Services EC2. All application instances share a connection to a MongoDB database for persistent storage - user accounts, issues, votes, etc. and a connection to a Redis database which currently provides session storage and, eventually, caching. Application instances may also be run as Windows services with aid of the PyWin32 module.

### Background & Extended Description
The platform seeks to increase representation of any constituency’s interests to constituency’s legislature by leveraging evolving concepts of user experience (UX) design and collaborative content generation in the field of software development. Ideally, the platform will counter-balance the influence of special-interest lobbyists – many of whom are not direct members of the constituency of the legislator which they are lobbying to. In a dangerous plausible scenario, a lobbyist’s interests might be more closely aligned with interests of a foreign power than with interests of the constituency.

Encroachment on a constituency’s representatives is sometimes evident in the lobbying efforts of resourceful entities. U.S. Representative Tony Cárdenas, in context of discussing the disproportionate influence of Comcast Corporation’s lobbying efforts on legislative decision-making, resolves via a Reddit post that while decision-making based solely on positions presented by lobbyists is rare, “Hearing people who are completely sure of themselves making a case helps me see parts of it I may not have seen before.”[1] Cárdenas also demonstrates a difficulty in identifying preferences of constituencies: “I don't get to be black and white. I have 750,000 shades of greyscale in my district…”[2] Disproportionate representation of interests thus appears to be catalyzed in part by legislators’ lack of access to definite comprehensible information about their constituencies’ preferences.[3] Additionally, much of the population arguably perceives real and imagined hindrances to individual participation in the form of a large & increasing constituent–representative ratio (average of over 738,000-to-1 for U.S. House of Representatives)[4] and depressed availability of time & interest to allocate to civic participation relative to immediate needs[5].

The My Issues platform adapts concepts exemplified in precedent online collaborative and social platforms to transparently aggregate and present constituencies’ preferences regarding relevant issues as well as possible responses to those issues. Reddit’s voting & ranking mechanism informs a similar design in My Issues for aggregating constituent preferences while Wikipedia’s mechanism for iteratively revising an article to reach and maintain consensus of article’s content and structure is adapted for issue definitions. Simple-to-use, rapidly-loading, and engaging user experiences in popular social media platforms such as Twitter and Facebook inform UX design in My Issues and simultaneously serve as conduits for cascading the visibility of the collaboratively-defined issues and consequently, visibility of and participation on the My Issues platform itself. Further work includes iterating on elements of platform design in response to feedback – e.g. mechanism function, UX, ‘branding’ & other details – and implementing alongside already-planned components – e.g. constituent authentication, settings pages.

#### Notes
[1] Cárdenas, Tony, "Proud Today That I Became One of the First House Members Vocally AGAINST Comcast/Time-Warner," Reddit, February 18, 2015, accessed July 4, 2015, https://www.reddit.com/r/technology/comments/2wcoxy/proud_today_that_i_became_one_of_the_first_house/copx5zn.

[2] Ibid.

[3] As well as lack of access by other legislatively influential entities, e.g. politicians, business leaders, media, and other constituents.

[4] The U.S. House of Representatives is limited by law to 435 members, while the overall population of the United States (321,288,000 – on July 14, 2015 at 1:13PM EST) is currently increasing at a rate of one (+1) every twelve seconds. “The House Explained,” United States House of Representatives, accessed November 18, 2014, http://www.house.gov/content/learn/. “Population Clock,” United States Census Bureau, accessed July 14, 2015, http://www.census.gov/popclock/.

[5] E.g. shopping for groceries & essential products, taking care of & educating children, household maintenance & upkeep.