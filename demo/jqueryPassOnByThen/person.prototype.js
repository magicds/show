if (Person) {
    Person.prototype.showName = function() {
        return this.name;
    };
} else {
    console.error('Person is undefined!');
}
