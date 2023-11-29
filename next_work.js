const fs = require('fs');
const process = require('process');
const request = require('request');

const apiUrl = 'https://icanhazdadjoke.com/search';

// Checks if someone wants to see the leaderboard
const isLeaderboardRequested = process.argv[2] === 'leaderboard';

if (isLeaderboardRequested) {
    displayLeaderboard(); // Show me the funniest joke of all time!
} else {
                        // searching for jokes
    const searchTerm = process.argv[2];
    if (!searchTerm) {
        console.log('Hey, you forgot to tell me what to search for! Please provide a search term for jokes.');
        process.exit(1);
    }

    requestJokes(searchTerm);
}

                   // Fetches some jokes 
function requestJokes(searchTerm) {
    request(
        {
            url: `${apiUrl}?term=${encodeURIComponent(searchTerm)}`,
            headers: { 'Accept': 'application/json' },
        },
        (error, response, body) => {
            if (error) {
                console.error('Oops, something went wrong while connecting to the joke API:', error);
                return;
            }

            if (response.statusCode !== 200) {
                console.error('Uh-oh, got an error from the API:', response.statusMessage);
                return;
            }

            const jokeData = JSON.parse(body);

            if (jokeData.results && jokeData.results.length > 0) {
                const randomJoke = jokeData.results[Math.floor(Math.random() * jokeData.results.length)].joke;
                displayJoke(randomJoke);

                // Saves the joke for later 
                saveJokeToFile(randomJoke);
            } else {
                console.log('Hmmm, no jokes found for your search term. Maybe the joke gods are on vacation today.');
            }
        }
    );
}

// Shows the user a joke
function displayJoke(joke) {
    console.log(`Alright, here's one for you: ${joke}`);
}

// Save the joke to our joke archive
function saveJokeToFile(joke) {
    fs.appendFile('jokes.txt', `${joke}\n`, (err) => {
        if (err) {
            console.error('Oops, had a little trouble saving the joke to file:', err);
        } else {
            console.log('Joke safely stored in jokes.txt for future laughs! 📂');
        }
    });
}

// Leaderboard functionality
function displayLeaderboard() {
    fs.readFile('jokes.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('Oops, had a problem reading jokes from file:', err);
            return;
        }

        const jokes = data.split('\n').filter((joke) => joke.trim() !== '');

        if (jokes.length === 0) {
            console.log('The jokes.txt file is as empty as a library on a Sunday. Start saving jokes to build a leaderboard!');
        } else {
            const mostPopularJoke = getMostPopularJoke(jokes);
            console.log(`And the most popular joke is...  ${mostPopularJoke}`);
           console.log("This one might bring laughs");
        }
    });
}

// Popular joke
function getMostPopularJoke(jokes) {
    const jokeCountMap = new Map();

    jokes.forEach((joke) => {
        jokeCountMap.set(joke, (jokeCountMap.get(joke) || 0) + 1);
    });

    let mostPopularJoke = '';
    let maxCount = 0;

    jokeCountMap.forEach((count, joke) => {
        if (count > maxCount) {
            mostPopularJoke = joke;
            maxCount = count;
        }
    });

    return mostPopularJoke;
}
