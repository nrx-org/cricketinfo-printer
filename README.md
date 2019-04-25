# wikipedia-printer

A service to generate screenshots and PDFs from URLs.

We built our own service instead of using an existing service because off-the-shelf solutions don't handle Indic fonts well. 

## Dependencies

- NodeJS and NPM
- Puppeteer (along with dependencies)
- Fonts
    - Lato
    - Charter
    - Noto Sans
    - Martel

### Puppeteer Dependencies

On Ubuntu (what we're using as our staging server), run the following command to install Chrome dependencies:

    $ sudo apt install gconf-service libasound2 libatk1.0-0 libatk-bridge2.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget

### Fonts

- Lato and Noto are available in the Ubuntu repositories:

    $ apt install fonts-lato fonts-noto

- Martel is available on GitHub:

    $ git clone https://github.com/typeoff/martel
    $ cd martel/"Martel Font Files"/"TTFs with ttfautohints"/
    $ mkdir ~/.local/share/fonts/
    $ cp *.ttf ~/.local/share/fonts/
    $ fc-cache -f -v

- Charter is available as a free download:

    $ curl -O https://practicaltypography.com/fonts/charter.zip
    $ unzip charter.zip
    $ cd charter/ttf/
    $ mkdir ~/.local/share/fonts/
    $ cp *.ttf ~/.local/share/fonts/
    $ fc-cache -f -v

## Running in Production

1. Make sure all dependencies are installed on your system.

2. Once NPM is installed, install `pm2` globally (may require sudo).

    $ npm i -g pm2

3. Clone the project repository and `cd` into it.

    $ git clone <repository-url>
    $ cd path/to/code

4. Install dependencies from NPM.

    $ npm i
 
5. Start the app using `pm2`.

    $ pm2 start npm --name "wikipedia-printer" -- start

6. You might want to reverse proxy requests to the app using Nginx or Apache.
