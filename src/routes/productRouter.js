import { Router } from "express";
//import { productManagerFS } from '../dao/productManagerFS.js';
import { productManagerDB } from "../dao/productManagerDB.js";
import { uploader } from "../utils/multerUtil.js";
import productModel from "../dao/models/productModel.js";

const router = Router();
//const ProductService = new productManagerFS('products.json');
const productManagerService = new productManagerDB();

router.get("/", async (req, res) => {
  try {
    let { limit = 10, page = 1, query = {}, sort = null } = req.query;
    const result = await productManagerService.getAllProducts(
      limit,
      page,
      query,
      sort
    );
    res.send({
      status: "success",
      payload: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      status: "error",
      message: error.message,
    });
  }
});

router.post("/", uploader.array("thumbnails", 3), async (req, res) => {
  if (req.files) {
    req.body.thumbnails = [];
    req.files.forEach((file) => {
      req.body.thumbnails.push(file.filename);
    });
  }

  try {
    const result = await productManagerService.createProduct(req.body);
    res.send({
      status: "success",
      payload: result,
    });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: error.message,
    });
  }
});

router.put("/:pid", uploader.array("thumbnails", 3), async (req, res) => {
  if (req.files) {
    req.body.thumbnails = [];
    req.files.forEach((file) => {
      req.body.thumbnails.push(file.filename);
    });
  }

  try {
    const result = await productManagerService.updateProduct(
      req.params.pid,
      req.body
    );
    res.send({
      status: "success",
      payload: result,
    });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: error.message,
    });
  }
});

router.delete("/:pid", async (req, res) => {
  try {
    const result = await productManagerService.deleteProduct(req.params.pid);
    res.send({
      status: "success",
      payload: result,
    });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: error.message,
    });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { title } = req.query;
    console.log(req.query);
    let query = {};
    if (title) query = { title };

    const products = await productModel.find(query).explain("executionStats");

    res.send({
      status: "success",
      payload: products,
    });
  } catch (error) {
    res.status(500).send({
      status: "error",
      payload: {
        message: error.message,
      },
    });
  }
});

router.get("/:pid", async (req, res) => {
  try {
    const result = await productManagerService.getProductByID(req.params.pid);
    res.send({
      status: "success",
      payload: result,
    });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: error.message,
    });
  }
});

export default router;
