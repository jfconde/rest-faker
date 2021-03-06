# REST-faker

## About

Faker (or REST Faker) is a Node.js tool that enables you to set up a mockup REST server to test against when developing
your apps by using simple JSON files. It currently supports GET, POST, PUT and DELETE requests as well as pagination and
sorting.

This app was originally developed to assist in the development and integration of ExtJS applications, augmenting 
conventional mockups with enhaced capabilities which more closely resemble the behaviour of a backend system.

## Installation

###### Requirements
* NodeJS ([download](https://nodejs.org/en/))
 
###### Setup
* Clone this repository - [https](https://github.com/jfconde/faker.git) / [ssh](git@github.com:jfconde/faker.git) / [svn](https://github.com/jfconde/faker)
* Install package dependencies using __npm install__.
* (Optional) Edit __config.json__, located in Faker's root folder.
* (Optional) Take a look inside the __example/__ folder to get the grasp of how to define your own resources and 
templates.
* Execute the comand __node faker__ to start your faker server. Enjoy!

###### Creating a resource
Defining a resource to be exposed by Faker's REST API is as easy as filling a JSON file with minimal data.

Let's review the process followed for the definition of a __Users__ resource. In the first place, we must navigate to
our servers folder (this path is defined in the __path.appServers__ property of our __config.json__. Let us imagine our
application is codenamed simply fooApp1. In our servers folder, we will create a folder called __fooApp1__, and a file
called Users.json. The root of all the resources in our fooApp1 application will be located under 
<server_address>/api/fooApp1, and Users.json will be mapped to the URI <server_address>/api/fooApp1/Users. 

Time to edit the contents of Users.json:

```
{
  "useId": true,
  "idParam": "id",
  "template": null,
  "actions": [
    "POST",
    "GET",
    "DELETE"
  ],

  "limitParam": "limit",

  "fields": [
    {
      "name": "id",
      "type": "int"
    },
    {
      "name": "name",
      "type": "string"
    },
    {
      "name": "surname",
      "type": "string"
    },
    {
      "name": "age",
      "type": "int"
    },
    {
      "name": "email",
      "type": "string"
    }
  ]
}
```

Here is a brief description of each property and its meaning:

* __useId__: true/false. Use true to indicate that this resource can be accessed by ID. In our case, this means that
in requests of the form /api/fooApp1/Users/__something__/... the part __something__ will be parsed as the ID of the
resource User being accesed (although, for nested resources, the value of this ID is irrelevant, since nested data 
manipulation is not available in faker. If __useId__'s value was false, then __something__ would be parsed as a resource
expected to be defined in our servers folder, at /fooApp1/Users/something/... or /fooApp1/Users/something.json.
* __idParam__: the name of the field that will be used as the ID parameter or attribute for this resource. In this case,
 __"id"__ implies that when we access /Users/1, the 1 is the value of the field __"id"__ (which is defined in the 
 __"fields"__ array several lines below). If we specified __"name"__, then accessing /Users/Tom would try to access the
data for the resource User whose "name" equals to "Tom".
* __template__: reference to a JSON file located under the path specified in __config.json__ under __path.templates__.
This JSON object can contain properties in it with the values __"{data}"__, __"{count}"__, __"{info}"__ or 
__"{success}"__. The API will then return JSON representations of this resource using the specified template and filling
the these special properties with the result data, number of matching elements, info/error messages and a success
property indicating whether the request was successful or not. For example, "template": "ext" would look for the file
__<path.templates>/ext.json__.
* __actions__: an array which should contain one or more the following values (non case-sensitive): "GET", "POST", "PUT"
or "DELETE". In this case, we allow reading (GET), creating (POST) and deleting (DELETE) resources of this type, but 
not updating (PUT).
* __limitParam__: when reading (GET) resources as a set, paging can be used by sending a limit, page and start 
parameters. Sorting can also be used by sending a sorter array param containing objects of the type {property: "...", 
direction: "asc/desc"}. When describing resources, like in this case, we can specify a limitParam / startParam /
pageParam / sortersParam to specify which query string parameter will act as the limit/start/page/sorters param.
* __fields__: a list of field definitions, including name and type. This type can be any of the following: int, string,
float, date, boolean and auto (no conversion, used for arrays or objects, for example).
* __data__: an array containing the data representing the model instance currently stored for this resource. 

## Further development
* Modularize more and/or better. Isolate the data reading/modifying so instead of JSON other storage systems can be
used (i.e. MySQL, MongoDB, etc.).