const path = require("path");
const express = require("express");
const methodOverride = require("method-override");
const morgan = require("morgan");
const { engine } = require("express-handlebars");
const app = express();
const port = 3000;
const sortMiddleware = require("./app/middleware/SortMiddleware");

const route = require("./routes");

//connect database
const db = require("./config/db");
const SortMiddleware = require("./app/middleware/SortMiddleware");
db.connect();

//Http logger
app.use(morgan("combined"));

//Cài đặt các middleware trong app.use
app.use(express.urlencoded({ extended: true })); //express.urlencoded() là 1 middleware xử lý, cấu trúc lại các data được gửi lên từ form và lưu chúng vào object body

app.use(express.json()); // xử lý data gửi lên từ JS như: XMLHttpRequest, fetch, axios

//giúp override lại method trong form của html
app.use(methodOverride("_method"));

//add sortMiddleware cho toàn bộ route trong project
app.use(sortMiddleware);

/**
 * Sử dụng static files để truy xuất image, css trên web
 * expres.static là 1 middleware
 */

app.use(express.static(path.join(__dirname, "public"))); //http://localhost:3000/img/logo192.png sẽ ra được image

//template engine
app.engine(
  ".hbs",
  engine({
    extname: ".hbs",
    helpers: {
      sum: function (a, b) {
        return a + b;
      },
      sortable: (field, sort) => {
        
        // Ko có line code này thì tất cả các cột đều có chung 1 loại icon sort
        const sortType = field === sort.column ? sort.type : "default";

        
        const types = {
          default: "desc",
          asc: "desc",
          desc: "asc",
        };
        
        const icons = {
          default: "fa-solid fa-sort",
          asc: "fa-solid fa-sort-up",
          desc: "fa-solid fa-sort-down",
        };
        
        const type = types[sortType];
        const icon = icons[sortType];

        //fa-sort, type: desc

        return `
          <a href="?_sort&column=${field}&type=${type}">
            <i class="${icon}"></i>
          </a>
        `;
      },
    },
  })
); //định nghĩa file '.hbs' bằng engine()
app.set("view engine", ".hbs");

app.set("views", path.join(__dirname, "resources", "views"));
//cho engin biết file main.hbs nằm ở đâu, __dirname: src, nếu dùng thêm: path.join(__dirname, 'resources', 'views'): src/resources/views

//Routes init
route(app);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
