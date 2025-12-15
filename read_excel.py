import pandas as pd
import sys

try:
    # 엑셀 파일 읽기
    df = pd.read_excel('guinness_test_data.xlsx')
    
    print("=" * 60)
    print("📊 guinness_test_data.xlsx 파일 정보")
    print("=" * 60)
    
    print(f"\n총 데이터 수: {len(df)}개")
    print(f"\n컬럼명: {list(df.columns)}")
    
    print("\n첫 10개 데이터:")
    print(df.head(10).to_string())
    
    print("\n\n데이터 타입:")
    print(df.dtypes)
    
    print("\n\n지역단별 인원:")
    print(df.groupby(df.columns[0]).size().to_string())
    
except Exception as e:
    print(f"오류 발생: {e}")
    import traceback
    traceback.print_exc()

