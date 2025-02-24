Option Explicit

Function SafeSheetName(strName As String) As String
    ' Replace invalid characters and ensure name is valid for Excel
    Dim result As String
    result = Replace(strName, " ", "_")
    result = Replace(result, "'", "")
    result = Replace(result, """", "")
    result = Replace(result, "[", "")
    result = Replace(result, "]", "")
    result = Replace(result, ":", "")
    result = Replace(result, "/", "")
    result = Replace(result, "\", "")
    result = Replace(result, "?", "")
    result = Replace(result, "*", "")
    
    ' Ensure name is not longer than 31 characters
    If Len(result) > 31 Then
        result = Left(result, 31)
    End If
    
    SafeSheetName = result
End Function

Sub ConvertToKML()
    Dim ws As Worksheet
    Dim lastRow As Long
    Dim i As Long
    Dim dict As Object
    Dim status As String
    Dim uniqueStatuses As Collection
    
    ' Set reference to first worksheet
    Set ws = ThisWorkbook.Sheets(1)
    
    ' Find last row with data
    lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row
    
    ' Create dictionary to store unique statuses
    Set dict = CreateObject("Scripting.Dictionary")
    Set uniqueStatuses = New Collection
    
    ' Get unique statuses
    For i = 2 To lastRow ' Assuming row 1 is header
        status = ws.Cells(i, 5).Value ' Status is in column E
        If Not dict.exists(status) Then
            dict.Add status, status
            uniqueStatuses.Add status
        End If
    Next i
    
    ' First delete any existing KML sheets
    Application.DisplayAlerts = False
    Dim sht As Worksheet
    For Each sht In ThisWorkbook.Sheets
        If sht.Name <> ws.Name Then ' Don't delete the data sheet
            sht.Delete
        End If
    Next sht
    Application.DisplayAlerts = True
    
    ' Process each unique status
    Dim statusItem As Variant
    For Each statusItem In uniqueStatuses
        ' Create new worksheet with safe name
        Dim newWs As Worksheet
        Dim sheetName As String
        sheetName = SafeSheetName(CStr(statusItem))
        
        Set newWs = ThisWorkbook.Sheets.Add(After:=ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count))
        newWs.Name = sheetName
        
        ' Clear the sheet
        newWs.Cells.Clear
        
        ' Add headers
        newWs.Range("A1").Value = "<?xml version=""1.0"" encoding=""UTF-8""?>"
        newWs.Range("A2").Value = "<kml xmlns=""http://www.opengis.net/kml/2.2"">"
        newWs.Range("A3").Value = "  <Document>"
        newWs.Range("A4").Value = "    <Style id=""" & Replace(statusItem, " ", "_") & """>"
        newWs.Range("A5").Value = "      <IconStyle>"
        newWs.Range("A6").Value = "        <Icon>"
        newWs.Range("A7").Value = "          <href>http://maps.google.com/mapfiles/ms/icons/red-dot.png</href>"
        newWs.Range("A8").Value = "        </Icon>"
        newWs.Range("A9").Value = "      </IconStyle>"
        newWs.Range("A10").Value = "    </Style>"
        
        ' Add locations for this status
        Dim currentRow As Long
        currentRow = 11
        
        For i = 2 To lastRow
            If ws.Cells(i, 5).Value = statusItem Then
                newWs.Cells(currentRow, 1).Value = "    <Placemark>"
                currentRow = currentRow + 1
                
                newWs.Cells(currentRow, 1).Value = "      <n>" & ws.Cells(i, 1).Value & "</n>"
                currentRow = currentRow + 1
                
                newWs.Cells(currentRow, 1).Value = "      <styleUrl>#" & Replace(statusItem, " ", "_") & "</styleUrl>"
                currentRow = currentRow + 1
                
                newWs.Cells(currentRow, 1).Value = "      <description><![CDATA[" & ws.Cells(i, 2).Value & "]]></description>"
                currentRow = currentRow + 1
                
                newWs.Cells(currentRow, 1).Value = "      <Point>"
                currentRow = currentRow + 1
                
                newWs.Cells(currentRow, 1).Value = "        <coordinates>" & ws.Cells(i, 4).Value & "," & ws.Cells(i, 3).Value & "</coordinates>"
                currentRow = currentRow + 1
                
                newWs.Cells(currentRow, 1).Value = "      </Point>"
                currentRow = currentRow + 1
                
                newWs.Cells(currentRow, 1).Value = "    </Placemark>"
                currentRow = currentRow + 1
            End If
        Next i
        
        ' Add closing tags
        newWs.Cells(currentRow, 1).Value = "  </Document>"
        currentRow = currentRow + 1
        newWs.Cells(currentRow, 1).Value = "</kml>"
        
        ' Format column width
        newWs.Columns("A").ColumnWidth = 120
    Next statusItem
    
    MsgBox "KML content has been generated in separate sheets for each status!", vbInformation
End Sub
