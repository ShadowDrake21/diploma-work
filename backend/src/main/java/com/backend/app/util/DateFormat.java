package com.backend.app.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class DateFormat {
	public static LocalDate parseIncomeDate(String date) {
        DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
		
		return LocalDate.parse(date, formatter);
	}
}
