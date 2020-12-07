define({ "api": [
  {
    "type": "get",
    "url": "/logout",
    "title": "Logout",
    "name": "Logout",
    "group": "User",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-auth-token",
            "description": "<p>User's unique x-auth-token.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "logout",
            "description": "<p>returns true or false</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "istokenDestroy",
            "description": "<p>returns true or false</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/user.js",
    "groupTitle": "User"
  },
  {
    "type": "put",
    "url": "/editProfile",
    "title": "Edit User Profile",
    "name": "editprofile",
    "group": "User",
    "description": "<p>This is the Description. It is multiline capable.</p> <p>Last line of Description.</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-auth-token",
            "description": "<p>User's unique x-auth-token.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "firstName",
            "description": "<p>string having maxlength 15 and minlength 4.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "middleName",
            "description": "<p>string having maxlength 15 and minlength 4.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "lastName",
            "description": "<p>string having maxlength 15 and minlength 4.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "gender",
            "description": "<p>string having values in [male,female,others].</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "dateOfBirth",
            "description": "<p>string having ISO format.</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "address",
            "description": "<p>object having address values</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "address_line_1",
            "description": "<p>houe number/plot number, accepts string and ./#</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "landmark",
            "description": "<p>accepts valid string</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "country_code",
            "description": "<p>accepts valid country code like &quot;IN&quot;</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "zip_code",
            "description": "<p>object having valid zipcode</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "address_type",
            "description": "<p>string accepted  billing,shipping</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "address_tag",
            "description": "<p>string accepted  home,others,work</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "having",
            "description": "<p>primary or alternate number</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "primary",
            "description": "<p>having valid number formatted string</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "alternate",
            "description": "<p>having valid number formatted string</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": " {\n     \"firstName\": \"jiru\",\n     \"lastName\": \"X.\",\n     \"middleName\": \"villima\",\n     \"gender\": \"female\",\n     \"dateOfBirth\": \"1999-09-21\",\n     \"address\": {\n           \"address_line_1\": \"h.no. 214\",\n           \"city\": \"Abohar\",\n           \"state\": \"Punjab\",\n           \"landmark\": \"near papu ki dukan\",\n           \"country_code\": \"IN\",\n           \"zip_code\": \"140301\",\n           \"address_type\": \"billing\",\n           \"address_tag\": \"home\",\n           \"phone\": {\n                \"primary\": \"+91 8725838433\",\n                \"alternate\": \"+91 7986474727\"\n           }\n     }\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "http://localhost:3000/api/users/editprofile"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": " HTTP/1.1 200 OK\n\n{\n    \"address\": {\n    \"phone\": {\n        \"primary\": \"+91 8725838433\",\n        \"alternate\": \"+91 7986474727\"\n     },\n    \"address_type\": \"billing\",\n    \"address_tag\": \"home\",\n    \"address_line_1\": \"h.no. 214\",\n    \"city\": \"Abohar\",\n    \"state\": \"Punjab\",\n    \"landmark\": \"near papu ki dukan\",\n    \"country_code\": \"IN\",\n    \"zip_code\": \"140301\"\n },\n\"isVerified\": true,\n\"_id\": \"5f49ff9cbca6c623709fc816\",\n\"userName\": \"jirux\",\n\"email\": \"jirux@yopmail.com\",\n\"__v\": 0,\n\"gender\": \"female\",\n\"dateOfBirth\": \"1999-09-21T00:00:00.000Z\",\n\"firstName\": \"jiru\",\n\"lastName\": \"X.\",\n\"middleName\": \"villima\",\n\"profileImg\": \"D:\\\\MyMeanStackProjects\\\\silo-app\\\\public\\\\profileImages\\\\woocommerce-placeholder-150x150.png\"\n }",
          "type": "json"
        }
      ],
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "logout",
            "description": "<p>returns true or false</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "istokenDestroy",
            "description": "<p>returns true or false</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/user.js",
    "groupTitle": "User"
  }
] });
