class Paginated {
  constructor(collection, perPage) {
    this.perPage = perPage;

    // Cursor
    this._collection = collection;

    // limit and loaded
    this._limit = this.perPage;
    this._loaded = 0;

    // Tracker Dependency
    this._limitListeners = new Deps.Dependency();
    this._loadedListeners = new Deps.Dependency();
  }

  loaded() {
    this._loadedListeners.depend();
    return this._loaded;
  }

  limit() {
    this._limitListeners.depend();
    return this._limit;
  }

  ready() {
    return _.isEqual(this.loaded(), this.limit());
  }

  next() {
    this._limit += this.perPage;
    this._limitListeners.changed();
  }

  done() {
    this._loaded = this._limit;
    this._loadedListeners.changed();
  }

  reset() {
    this._limit = this.perPage;
    this._limitListeners.changed();
  }

  subscribe() {

    // subscribe autorun then
    Meteor.autorun(() => {
      const handle = Meteor.subscribe(this._collection.name, this.limit());

      // if we are re-subscribing to an already ready subscription.
      Meteor.autorun(() => {
        if (handle.ready()) {
          this.done();
        }
      });
    });
  }
}

// Merge assign attachPaginated method.
Object.assign(Mongo.Collection.prototype, {
  attachPaginated(perPage) {
    this.paginated = new Paginated(this._collection, perPage);
  }
});