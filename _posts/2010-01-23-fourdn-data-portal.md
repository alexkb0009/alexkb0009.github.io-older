---
title: 4D Nucleome Data Portal
layout: post
permalink: 4dn-data-portal
years: 2016-Present
tags: ["JavaScript", "React.js", "D3", "Python", "PostgreSQL", "ElasticSearch", "Pyramid", "AWS", "API", "Platform", "SCSS"]
description: Something Something something
link: https://data.4dnucleome.org
link_title: Production Site
---

Data coordination portal for the 4D Nucleome (4DN) project built in Harvard Medical School's Department of Biomedical Informatics (HMS DBMI). Leading front-end development.

A single-page application (SPA) built on React.js which enables researchers to upload, share, browse, and download large data-files relating to the research of 4DN.

Back-end is built in Python 3 as a RESTful API using the Pyramid web framework, with server-side rendering of the API response performed with React.js.

This portal integrates the work of other teams both at Harvard Medical School's Department of Biomedical Informatics (HMS DBMI) and other organizations, such as UMass Medical School (UMMS), which have built out visualization tools such as [HiGlass](https://higlass.io) and a microscope configuration GUI. We have helped partner teams build out and package such projects as reusable/distributable React components w. Babel, Webpack, and NPM which we can then import and use in the 4DN portal (with code-splitting).

Among notable visualization features which have been specifically built inside the 4DN portal includes the [Workflow and File Provenance graphing component(s)]({% post_url 2010-01-22-react-workflow-viz-lib %}) which can graph any CWL-based Workflow representation. This Worklow visualization library is [being put into its own repository](https://github.com/4dn-dcic/react-workflow-viz) and at some point will be available on NPM.
