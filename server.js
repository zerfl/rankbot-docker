const fetch = require("node-fetch");
const express = require("express");
const app = express();
const port = 3000;

const profileUrlPrefix = `https://api.tracker.gg/api/v2/rocket-league/standard/profile/`;
const validPlatforms = ["epic", "steam", "xbl", "psn", "switch"];
const playlistMapper = new Map();
playlistMapper.set(10, "1v1");
playlistMapper.set(11, "2v2");
playlistMapper.set(13, "3v3");

class HTTPResponseError extends Error {
  constructor(response, ...args) {
    super(
      `HTTP Error Response: ${response.status} ${response.statusText}`,
      ...args
    );
    this.response = response;
  }
}

const isValidPlatform = (platform) => {
  return validPlatforms.includes(platform);
};

const checkStatus = (response) => {
  if (response.ok) {
    return response;
  } else {
    throw new HTTPResponseError(response);
  }
};

const parseRanks = (data) => {
  const playlists = data.data.segments.filter((segment) => {
    return (
      [...playlistMapper.keys()].indexOf(segment.attributes.playlistId) !== -1
    );
  });
  let rank = [];

  playlists.forEach((playlist) => {
    const playlistName = playlistMapper.get(playlist.attributes.playlistId);
    const division = playlist.stats.division.metadata.name.replace(
      "Division",
      "Div"
    );
    const deltaUp = playlist.stats.division.metadata.deltaUp;
    const deltaDown = playlist.stats.division.metadata.deltaDown;

    if (deltaUp && deltaDown) {
      rank.push(
        `${playlistName}: ${playlist.stats.tier.metadata.name} ${division} (${playlist.stats.rating.value} +${deltaUp} -${deltaDown})`
      );
    } else {
      rank.push(
        `${playlistName}: ${playlist.stats.tier.metadata.name} ${division} (${playlist.stats.rating.value})`
      );
    }
  });

  return rank.join(" // ");
};

app.get("/:platform/:username", async (req, res) => {
  const platform = req.params.platform;
  const username = req.params.username;
  const url = `${profileUrlPrefix}${platform}/${username}`;

  if (!isValidPlatform(platform)) {
    res.status(400).send("Invalid platform BrokeBack");
    return;
  }

  const response = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.164 Safari/537.36",
    },
  });

  try {
    checkStatus(response);
    const data = await response.json();
    res.send(parseRanks(data));
  } catch (error) {
    res.send(`${error.response.statusText} BrokeBack`);
  }
});

app.listen(port, () => {
  console.log(`Rocket League Ranks listening at http://localhost:${port}`);
});
