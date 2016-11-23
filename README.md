# tulsa-county-inmate-information-center-api
JSON wrapper for tulsa county inmate information center PDF reports.

##Installation
This API runs on node.js. It was written against v6.9.1 but should generally
be compatible with most node versions.

###Prerequisites
* NodeJS

###Running from Source
    $ git clone https://github.com/codefortulsa/tulsa-county-inmate-information-center-api.git
    $ cd tulsa-county-desk-blotter-api
    $ npm install
    $ node server.js

Note: it is recommended to run the server using a tool like forever to keep it
running in the background.

##How does it work?
When a request is made to the api at http://localhost:3030/deskBlotter, the
following PDF is downloaded: http://iic.tulsacounty.org/srsreports/Desk%20Blotter.pdf.
The PDF is then processed by pdf2json and the resulting JSON is parsed for
the data.

When a request is made to the api at http://localhost:3030/inmateBooking, the
following PDF is downloaded: http://iic.tulsacounty.org/expInmateBookings/Export.
The PDF is then processed by pdf2json and the resulting JSON is parsed for
the data.

This means each time a request is made the PDF is re-downloaded. Some sort of
caching is planned for the future.

##Live API
* Desk Blotter Report: http://data.thekinfamily.com/deskBlotter
* Inmate Booking Report: http://data.thekinfamily.com/inmateBooking
