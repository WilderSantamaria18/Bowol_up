package com.bowol.source;

import java.util.List;

public interface TrendSourceConnector {

    TrendSourceCode getSourceCode();

    List<RawTrendItem> fetchTrends(int limit);
}
