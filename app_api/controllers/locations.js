var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

let sendJsonResponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

let theEarth = (function() {
  let earthRadius = 6371;

  let getDistanceFromRads = function(rads) {
    return parseFloat(rads * 1000);
  };

  let getRadsFromDistance = function(distance) {
    return parseFloat(distance / 1000);
  };

  return {
    getDistanceFromRads: getDistanceFromRads,
    getRadsFromDistance: getRadsFromDistance
  };
})();

module.exports.locationsListByDistance = function(req, res) {
  let lng = parseFloat(req.query.lng);
  let lat = parseFloat(req.query.lat);
  let point = {
    type: "Point",
    coordinates: [lng, lat]
  };

  let dist = parseFloat(req.query.maxDistance);

  let geoOptions = {
    spherical: true,
    maxDistance: theEarth.getDistanceFromRads(dist),
    num: 10
  };

  if((!lng && lng !== 0) || (!lat && lat !== 0) || !dist) {
    sendJsonResponse(res, 404, {
      "message": "lng, lat, and maxDistance query parameters are required"
    });
    return;
  }

  Loc.geoNear(point, geoOptions, function(err, results, stats) {
    let locations = [];
    if(err) {
      sendJsonResponse(res, 404, err);
    } else {
      results.forEach(function(doc) {
        locations.push({
          distance: theEarth.getRadsFromDistance(doc.dis),
          name: doc.obj.name,
          address: doc.obj.address,
          rating: doc.obj.rating,
          facilities: doc.obj.facilities,
          _id: doc.obj._id
        });
      });
      sendJsonResponse(res, 200, locations);
    }
  });
};

module.exports.locationsCreate = function(req, res) { 
  Loc.create({
    name: req.body.name,
    address: req.body.address,
    facilities: req.body.facilities.split(","),
    coords: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
    openingTimes: [{
      days: req.body.days1,
      opening: req.body.opening1,
      closing: req.body.closing1,
      closed: req.body.closed1,
    },{
      days: req.body.days2,
      opening: req.body.opening2,
      closing: req.body.closing2,
      closed: req.body.closed2,
    }]
  }, function(err, location) {
    if(err) {
      sendJsonResponse(res, 400, err);
    } else {
      sendJsonResponse(res, 201, location);    
    }
  });  
};

module.exports.locationsReadOne = function(req, res) {
  if(req.params && req.params.locationid) {
    Loc
      .findById(req.params.locationid)
      .exec(function(err, location) {
        if(!location) {
          sendJsonResponse(res, 404, {
            "message": "locationid not found"
          });
          return;
        } else if(err) {
          sendJsonResponse(res, 404, err);
          return;
        }
        sendJsonResponse(res, 200, location);
    });
  } else {
    sendJsonResponse(res, 404, {
      "message": "no locationid in request"
    });
  }
};

module.exports.locationsUpdateOne = function(req, res) { 
  if(!req.params.location) {
    sendJsonResponse(res, 404, {
      "message": "Not found, locationid is required"
    });
    return;
  }

  Loc
    .findById(req.params.locationid)
    .select('-reviews -rating')
    .exec(
      function(err, location) {
        if(!location) {
          sendJsonResponse(res, 404, {
            "message": "locationid not found"
          });
          return;
        } else if(err) {
          sendJsonResponse(res, 400, err);
          return;
        }

        location.name = req.body.name;
        location.address = req.body.address;
        location.facilities = req.body.facilities.split(",");
        location.coords = [parseFloat(req.body.lng), parseFloat(req.body.lat)];

        location.openingTimes = [{
          days:req.body.days1,
          opening: req.body.opening1,
          closing: req.body.closing1,
          closed: req.body.closed1,
        },{
          days:req.body.days2,
          opening: req.body.opening2,
          closing: req.body.closing2,
          closed: req.body.closed2,
        }];

        location.save(function(err, location) {
          if(err) {
            sendJsonResponse(res, 404, err);
          } else {
            sendJsonResponse(res, 200, location);
          }
        });
      }
  );
};

module.exports.locationsDeleteOne = function(req, res) { 
  let locationid = req.params.locationid;
  if (locationid) {
    Loc
      .findByIdAndRemove(locationid)
      .exec(
        function(err, location) {
          if (err) {
          sendJsonResponse(res, 404, err);
          return;
        }
        sendJsonResponse(res, 204, null);
      }
    );
  } else {
    sendJsonResponse(res, 404, {
      "message": "No locationid"
    });
  }
};