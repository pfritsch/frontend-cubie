# Frontend Cubie v2

## Requirements

You'll need to have the following items installed before continuing.

  * [Node.js](http://nodejs.org): Use the installer provided on the NodeJS website.
  * [Gulp](http://gruntjs.com/):

```
[sudo] npm install gulp-cli -g
npm install gulp -D
touch gulpfile.js
```

## Quickstart

Open you terminal, go to the folder: `cd [your_path]/[your_project_name]/`
And then install the dependencies:

```

npm install

```

While you're working on your project, run:

`gulp` to generate the pages

And you're set!


## Directory Structure

* `src/`: The sources
* `src/index.html`: The content of the homepage
* `src/assets`: Images, fonts, icons...
* `src/scripts`: Javascripts
* `src/styles`: SASS files

* `app/`: The generated pages (overwritten overtime your run gulp)
* `app/styleguide`: The auto-generated documentation


## How to add an icon?

* Start by creating or choosing a vector icon from the [Entypo library](http://www.entypo.com/)
* Add the SVG-formatted icon in `src/assets/icons/`
* Link your icon in the html:

```
<svg class="icon-{name_of_you_icon}"><use xlink:href="#icon-{name_of_you_icon}"></use></svg>
```

* Run `gulp` again
