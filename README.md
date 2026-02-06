# url_shortening_service
simple URL shortening API made with Node.Js and Express.js, and a PostgreSQL server. Shortened URL looks like this : 
  `yourURL/shorten/[shortcode]`
example:
  `http://localhost:8080/shorten/0bg2QLZ19p2l7ombHQmYy`


Features
---
- Create an always unique shortened URL
- Access original URL through shortened URL
- Obtain list of all URLs
- Update a shortened URL to a new one
- Delete a shortened URL
  
Setup
---
- Clone the repository
- run `npm install` on the terminal
- Edit and rename the .env file in your project, input your database credentials as per the example.
- Setup and turn on your database. Here is the query for the table (my tablename is tinyurls):
  ~~~
  CREATE TABLE IF NOT EXISTS public.tinyurls
  (
    shortened character(30) COLLATE pg_catalog."default" NOT NULL,
    origin text COLLATE pg_catalog."default" NOT NULL,
    clicks integer NOT NULL DEFAULT 0,
    CONSTRAINT tinyurls_pkey PRIMARY KEY (shortened),
    CONSTRAINT unique_origin UNIQUE (origin)
  )
- in your project root terminal, run `node .` to run the server.

API
---
1. `GET /shorten/[shortened code]` : Open the original URL through shortened URL.
2. `POST /shorten/` : Create new URL with `application/json` body.
  Request:
   ~~~
   {
     "url":"your-original-url.com"
   }
  Response: Status code `201` if new entry is added. 
  ~~~
  {
    success: true,
    message: "New entry created.",
    shortened: "some-shorter-url"
  }
~~~
  Status code `200` if the same URL is present in the database.
  ~~~
  {
    success: true,
    message: "Entry already exists"
  }
~~~

3. `PUT /shorten/` : Update existing URL with `application/json` body.
   Request:
   
~~~
   {
     "url":"your-new-url.com"
   }
Response: Status code `201` if new entry is added.
~~~
Response:
~~~
  {
    success: true,
    message: "New entry created.",
    shortened: "some-new-shorter-url"
  }
~~~
4. `DELETE /shorten/[shortened code]` : Delete a shortened URL with `application/json` body.
  Request:
~~~
{
     "url":"your-short-url.com"
}
~~~
  Response:
~~~
{
  success: true,
  message: `Shortened link ${shortened} for deleted.`
}
~~~
