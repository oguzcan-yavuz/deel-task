const { calculateTotalJobPrice, isDepositAmountValid } = require("./balance");

describe("calculateTotalJobPrice()", () => {
  it("should return the sum of prices correctly", () => {
    // Arrange
    const jobs = [
      {
        id: 1,
        price: 100,
      },
      {
        id: 2,
        price: 25,
      },
      {
        id: 3,
        price: 50.8,
      },
      {
        id: 4,
        price: 60.7,
      },
    ];

    // Act
    const price = calculateTotalJobPrice({ jobs });

    // Assert
    expect(price).toBe(236.5);
  });
});

describe("isDepositAmountValid()", () => {
  it("should not be valid for deposit amount higher than 25% of total of jobs to pay", () => {
    // Arrange
    const depositAmount = 100;
    const amountToPay = 200;

    // Act
    const isValid = isDepositAmountValid({ depositAmount, amountToPay });

    // Assert
    expect(isValid).toBe(false);
  });

  it("should be valid for deposit amount lower than 25% of total of jobs to pay", () => {
    // Arrange
    const depositAmount = 100;
    const amountToPay = 500;

    // Act
    const isValid = isDepositAmountValid({ depositAmount, amountToPay });

    // Assert
    expect(isValid).toBe(true);
  });
});
