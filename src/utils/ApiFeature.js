export class ApiFeature {
  constructor(mongoQuery, query) {
    this.mongoQuery = mongoQuery;
    this.query = query;
  }

  pagination({ size = 2 } ={}) {
    if (this.query?.page <= 0) this.query.page = 1;
    let PAGE_NUMBER = this.query?.page * 1 || 1; // if string(NAN || 1)
    let PAGE_LIMIT = size;
    let SKIP = (PAGE_NUMBER - 1) * PAGE_LIMIT;

    this.mongoQuery = this.mongoQuery.skip(SKIP).limit(PAGE_LIMIT);
    return this;
  }

  filter() {
    let filterObj = { ...this.query };
    // let execludedQuery = ["page", "sort", "fields", "filter"];
    // execludedQuery.forEach((q) => {
    //   delete filterObj[q];
    // }); or strictQuery
    filterObj = JSON.stringify(filterObj);
    filterObj = filterObj.replace(/(gt|gte|lt|lte|ne|regex)/g, (match) => `$${match}`);
    filterObj = JSON.parse(filterObj);
    this.mongoQuery.find(filterObj);
    return this;
  }

  sort() {
    if (this.query?.sort) {
      let sortBy = this.query.sort.split(",").join(" "); // sort by more than one feild
      this.mongoQuery.sort(sortBy);
    }
    return this;
  }

  fields() {
    if (this.query?.fields) {
      let selected = this.query.fields.split(",").join(" ");
      this.mongoQuery.select(selected);
    }
    return this;
  }

  search(by = ['title','description','name']) {
    if (this.query?.keyword) {
      // search : tv >>(lgtv , toshipatv) // any thing that include keyword(tv)
      let keyword = this.query?.keyword
      const orConditions = by.map(feild=>({
        [feild]: { $regex:  keyword, $options: "i" } 
          
      }))
      this.mongoQuery.find({
        $or: orConditions
      });

    }
    return this;
  }
}
