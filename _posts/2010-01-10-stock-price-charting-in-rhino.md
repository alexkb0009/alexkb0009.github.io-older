---
title: Stock Price Charting in Rhino
layout: post
permalink: stock-price-charting-in-rhino
years: 2012
tags: ["3D", "Finance", "C#", "Rhino", "Grasshopper", "Data Visualization"]
description: Something Something something
link: 'https://vimeo.com/51163130'
link_title : "Watch Demo (Vimeo)"
---

An experiment in 3D data visualization for an academic course using Rhino 3D modeling software and Grasshopper (a generative modeling plugin) to scrape and plot stock quotes in near- real time. A console C# script fetches stock quotes from a finance-related page and saves them to a text file periodically, while a synchronized C# script in Grasshopper read that file and charted the quotes accordingly in the Rhino viewport. The script also connects the plotted points to create a chart in 3D space, and provides an interface for controlling scale and showing day's range. A few levels of moving averages were added, as well.