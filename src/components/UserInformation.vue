<template>
  <div class="chart-container">
    <!-- Dropdown for selecting the period of sales data to display -->
    <div class="dropdown-container">
      <select
        v-model="selectedDays"
        @change="fetchDailySalesOverview(selectedDays)"
      >
        <option value="60">Last 60 Days</option>
        <option value="30">Last 30 Days</option>
        <option value="14">Last 14 Days</option>
        <option value="7">Last 7 Days</option>
      </select>
    </div>
    <!-- Container for the Highcharts graph -->
    <div id="container"></div>
    <!-- Responsive table to display sales details for selected dates -->
    <div class="table-responsive" v-if="isTableVisible">
      <table class="table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Product Name</th>
            <th>
              {{ getDayOfWeek(dailySalesInformation.selectedDate) }}
              <br />
              {{ dailySalesInformation.selectedDate }} <br />
              Sales / Units <br />
              Avg. Selling Price
            </th>

            <th v-if="dailySalesInformation.selectedDate2">
              {{ getDayOfWeek(dailySalesInformation.selectedDate2) }}
              <br />
              {{ dailySalesInformation.selectedDate2 }} <br />
              Sales / Units <br />
              Avg. Selling Price
            </th>
            <th>SKU Refund Rate</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in skuDetails" :key="item.sku">
            <td>{{ item.sku }}</td>
            <td>{{ item.productName }}</td>
            <td>
              {{
                "$" +
                item.amount +
                "/" +
                item.qty +
                "/" +
                "$" +
                item.amount / item.qty
              }}
            </td>
            <td v-if="dailySalesInformation.selectedDate2">
              {{
                "$" +
                (item.amount + item.amount2) +
                "/" +
                (item.qty + item.qty2) +
                "/" +
                "$" +
                (item.amount + item.amount2) / (item.qty + item.qty2)
              }}
            </td>
            <td>{{ item.refundRate === 0 ? "-" : item.refundRate }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Pagination controls -->
    <nav aria-label="Page navigation">
      <ul class="pagination">
        <li v-if="currentPage > 1" class="page-item">
          <a
            class="page-link"
            href="#"
            aria-label="Previous"
            @click.prevent="changePage(currentPage - 1)"
          >
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>
        <li
          class="page-item"
          :class="{ active: page === currentPage }"
          v-for="page in paginationRange"
          :key="page"
        >
          <a class="page-link" href="#" @click.prevent="changePage(page)">
            {{ page }}
          </a>
        </li>

        <li v-if="currentPage < totalPages" class="page-item">
          <a
            class="page-link"
            href="#"
            aria-label="Next"
            @click.prevent="changePage(currentPage + 1)"
          >
            <span aria-hidden="true">&raquo;</span>
          </a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import axios from "axios";
import Highcharts from "highcharts";

export default {
  data() {
    return {
      chart: null,
      selectedDays: 30,
      selectedDates: [],
      skuDetails: [],
      dailySalesInformation: [],
      isShiftPressed: false,
      totalPages: 0,
      currentPage: 1,
      lastPageShown: 0,
      pageNumber: 0,
      isTableVisible: false,
    };
  },
  // Event listeners for shift key detection
  mounted() {
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);
  },
  // Cleanup event listeners on component destruction
  beforeDestroy() {
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);
  },
  // Computed property to access user information from the Vuex store
  computed: {
    userInfo() {
      return this.$store.state.user.userInfo;
    },
    // Generates an array of page numbers for pagination
    paginationRange() {
      const range = [];
      for (let i = 1; i <= this.totalPages; i++) {
        range.push(i);
      }
      return range;
    },
  },
  created() {
    this.fetchDailySalesOverview(30);
  },
  methods: {
    // Fetches daily sales overview data based on selected time frame
    async fetchDailySalesOverview(day) {
      const storeInfo = this.userInfo.user.store[0];
      const accessToken = this.$store.state.user.accessToken;
      try {
        const response = await axios.post(
          "https://iapitest.eva.guru/data/daily-sales-overview",
          {
            customDateData: null,
            day: day,
            excludeYoYData: true,
            marketplace: storeInfo.marketplaceName,
            requestStatus: 0,
            sellerId: storeInfo.storeId,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        this.createChart(response.data.Data.item);
      } catch (error) {
        console.error("Cannot get Daily Sales From API :", error);
      }
    },
    // Utility method to get the day of the week from a date string
    getDayOfWeek(date) {
      const options = { weekday: "long" };
      return new Date(date).toLocaleDateString("en-US", options);
    },
    // Generates the Highcharts chart based on fetched data
    createChart(dataItems) {
      const categories = dataItems.map((item) => {
        const [year, month, day] = item.date.split("-");
        const date = new Date(year, month - 1, day);

        return `${date.toLocaleDateString("en-US", {
          weekday: "long",
        })},${day}-${month}-${year}`;
      });
      const fbaAmounts = dataItems.map((item) => ({
        y: item.fbaAmount,
        stack: "sales",
      }));
      const profits = dataItems.map((item) => ({
        y: item.profit,
        stack: "sales",
      }));
      const fbmAmounts = dataItems.map((item) => ({
        y: item.fbmAmount,
        stack: "sales",
      }));
      const totalSales = dataItems.map((item) => ({
        y: item.fbmAmount + item.fbmAmount,
        stack: "totalSales",
      }));

      const shipping = dataItems.map((item) => ({
        y: item.fbaShippingAmount,
        stack: "shipping",
      }));

      this.chart = Highcharts.chart("container", {
        chart: {
          type: "column",
          backgroundColor: "#f8f8f8",
        },
        title: {
          text: "Daily Sales",
        },
        xAxis: {
          categories: categories,
          labels: {
            rotation: -45,
          },
        },
        yAxis: {
          gridLineColor: "#e6e6e6",
          gridLineWidth: 1,
          gridLineDashStyle: "dash",
          min: 0,
          title: {
            text: "Amount ($)",
          },
          stackLabels: {
            enabled: true,
            style: {
              fontWeight: "bold",
              color:
                (Highcharts.defaultOptions.title.style &&
                  Highcharts.defaultOptions.title.style.color) ||
                "gray",
            },
          },
        },
        tooltip: {
          shared: true,
        },
        plotOptions: {
          column: {
            cursor: "pointer",
            stacking: "normal",
            point: {
              events: {
                click: this.onPointClick,
              },
            },
          },
        },
        series: [
          {
            name: "Total Sales",
            data: totalSales,
            color: "orange",
          },
          {
            name: "FBA Sales",
            data: fbaAmounts,
            color: "blue",
          },
          {
            name: "FBM Sales",
            data: fbmAmounts,
            color: "purple",
          },
          {
            name: "Profit",
            data: profits,
            color: "green",
          },

          {
            name: "Shipping",
            data: shipping,
            color: "red",
          },
        ],
      });
    },
    // Sets flag if shift key is pressed
    handleKeyDown(event) {
      if (event.key === "Shift") {
        this.isShiftPressed = true;
      }
    },
    // Resets flag when shift key is released
    handleKeyUp(event) {
      if (event.key === "Shift") {
        this.isShiftPressed = false;
      }
    },
    // Handles chart column click to display SKU details table and fetch data
    onPointClick(event) {
      this.isTableVisible = !this.isTableVisible;
      const clickedDate = event.point.category;

      if (
        this.isShiftPressed &&
        this.selectedDates.length < 2 &&
        !this.selectedDates.includes(clickedDate)
      ) {
        this.selectedDates.push(clickedDate);
      } else if (!this.isShiftPressed) {
        this.selectedDates = [clickedDate];
      }

      if (this.selectedDates.length > 0) {
        this.fetchSKUDetails();
      }
    },
    // Formats a date string for consistency in requests
    formatDate(dateString) {
      const parts = dateString.split(",");
      const dateParts = parts[1].trim().split("-");
      return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    },
    // Changes the current page and fetches SKU details for the new page
    changePage(newPage) {
      this.currentPage = newPage;
      this.fetchSKUDetails(newPage);
    },
    // Fetches SKU details based on selected dates and page number
    async fetchSKUDetails(pageNumber = 1) {
      const storeInfo = this.userInfo.user.store[0];
      const accessToken = this.$store.state.user.accessToken;

      if (this.currentPage === 1 || this.currentPage === 2) {
        this.pageNumber = 1;
      } else {
        this.pageNumber = 2;
      }
      const params = {
        marketplace: storeInfo.marketplaceName,
        sellerId: storeInfo.storeId,
        salesDate:
          this.selectedDates.length > 0
            ? this.formatDate(this.selectedDates[0])
            : "",
        salesDate2:
          this.selectedDates.length > 1
            ? this.formatDate(this.selectedDates[1])
            : "",
        pageSize: 30,
        pageNumber: this.pageNumber,
        isDaysCompare: this.selectedDates.length === 2 ? 1 : 0,
      };

      try {
        const response = await axios.post(
          "https://iapitest.eva.guru/data/daily-sales-sku-list",
          params,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const fullSkuList = response.data.Data.item.skuList;
        const dailySalesInfo = response.data.Data.item;
        const totalItems = fullSkuList.length;
        this.totalPages = Math.ceil(totalItems / 5);

        const startIndex = (pageNumber - 1) * 5;
        const endIndex = pageNumber * 5;
        this.skuDetails = fullSkuList.slice(startIndex, endIndex);
        this.dailySalesInformation = dailySalesInfo;
        //console.log("daily" + JSON.stringify(this.dailySalesInformation));
        params.pageNumber = this.lastPageShown;

        if (this.skuDetails.length > 0) {
          this.lastPageShown = this.currentPage;
        }

        await this.fetchSKURates(
          storeInfo.marketplaceName,
          storeInfo.storeId,
          this.skuDetails
        );
      } catch (error) {
        console.error("Cannot get SKU Details :", error);
      }
    },
    // Fetches SKU refund rates for the displayed SKU details
    async fetchSKURates(marketplace, sellerId, skuList) {
      const accessToken = this.$store.state.user.accessToken;
      const requestedDay = 0;

      try {
        const response = await axios.post(
          "https://iapitest.eva.guru/data/get-sku-refund-rate",
          {
            marketplace,
            sellerId,
            skuList: skuList.map((sku) => sku.sku),
            requestedDay,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const ratesData = response.data.Data;
        // console.log("rates" + JSON.stringify(response.data.Data));
        if (Array.isArray(ratesData)) {
          this.skuDetails = this.skuDetails.map((detail) => {
            const rate = ratesData.find((r) => r.sku === detail.sku);
            if (rate) {
              detail.refundRate = rate.refundRate === 0 ? "-" : rate.refundRate;
            }
            return detail;
          });
        } else {
          console.error("Error in SKUList");
        }
      } catch (error) {
        console.error("Cannot Get SKU Refund Rates :", error);
      }
    },
  },
};
</script>

<style>
/* CSS styles for the chart container, table, and pagination controls */
#container {
  width: 100%;
  height: 400px;
}

.table {
  margin: 3% auto;
  width: 94%;
  border-collapse: collapse;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table thead {
  background-color: #f2f2f2;
  color: #333;
}

.table thead th {
  padding: 12px 15px;
}

.table tbody tr:nth-child(odd) {
  background-color: #f9f9f9;
}

.table tbody tr:nth-child(even) {
  background-color: #ffffff;
}

.table tbody td {
  padding: 12px 15px;
  border-top: 1px solid #ddd;
}

.dropdown-container {
  position: absolute;
  right: 10px;
  top: 10px;
}

.pagination {
  display: flex;
  justify-content: center;
  list-style: none;
  padding: 20px 0;
}

.page-item {
  margin: 0 5px;
}

.page-link {
  border: 1px solid #dee2e6;
  border-radius: 50%;
  color: #007bff;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  width: 40px;
  text-decoration: none;
}

.page-item.active .page-link {
  background-color: #007bff;
  color: white;
}

.page-link:hover {
  color: #0056b3;
  text-decoration: none;
  background-color: #e9ecef;
  border-color: #dee2e6;
}

.page-link[aria-label="Previous"],
.page-link[aria-label="Next"] {
  border-radius: 50%;
}
</style>
